import { Get, Post, Route, Tags, Security, FormField, Request, UploadedFile} from "tsoa";
import {AUTHORIZATION, IResponse, My_Controller} from "./controller";
import bcrypt from "bcryptjs"
import { UserModel} from "../models/user";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import {USER_ROLE} from "../models/role";
import { PERMISSION } from "../models/permission";
import express from "express";
import {driverCreateSchema} from "../validations/driver.validation";
import {VehicleController} from "./vehicle.controller";
import {RegionModel} from "../models/regions";
import {Prisma} from "@prisma/client";
const response = new ResponseHandler()

@Tags("Driver Controller")
@Route("/driver")

export class DriverController extends My_Controller {
    private VehicleCtrl = new VehicleController()
    @Security(AUTHORIZATION.TOKEN, [PERMISSION.READ_DRIVER])
    @Get("")
    public async index(): Promise<IResponse> {
        try {
            let findDriver = await UserModel.findMany({
                where: {
                    roleId: USER_ROLE.DRIVER
                },
                include:{
                    region: true,
                    vehicle_interimaire: true,
                    vehicle_principal: true,
                    image: true,
                    city: true,
                    grade: true,
                    role: true
                },
            })
            if(!findDriver)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "User found with success !", findDriver)
        }catch(e){
            return response.catchHandler(e)
        }

    }

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ADD_DRIVER])
    @Post("")
    public async addDrivers(
        @UploadedFile() image: Express.Multer.File,
        @FormField() first_name: string,
        @FormField() last_name: string,
        @FormField() email: string,
        @FormField() birthday: Date,
        @FormField() place_Birth: string,
        @FormField() phone: string,
        @FormField() cni_number: string,
        @FormField() city_id: string,
        @FormField() grade_id: string,
        @FormField() driver_type_id: string,
        @FormField() driver_licence_number: string,
        @FormField() driver_licence_type: string,
        @FormField() country_licence_delivery: string,
        @FormField() issue_delivery_on: Date,
        @FormField() expire_delivery_at: Date,
        @FormField() region_id: string,
        @Request() request: express.Request,
        @FormField() vehicle_principal_id?: string,
        @FormField() vehicle_interimaire_id?: string
    ): Promise<IResponse> {
        try {
            let body = {
                first_name,
                last_name,
                email,
                birthday,
                place_Birth,
                phone,
                cni_number,
                city_id,
                grade_id,
                driver_type_id,
                driver_licence_number,
                driver_licence_type,
                country_licence_delivery,
                issue_delivery_on,
                expire_delivery_at,
                region_id,
                vehicle_principal_id,
                vehicle_interimaire_id,
            }
            const validate = this.validate(driverCreateSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            let checkEmail = await UserModel.findFirst({where: {email: body.email,},});
            if(checkEmail)
                return response.liteResponse(code.FAILURE, "Driver with this email already exist", null)

            let checkLicenceNumber = await UserModel.findFirst({where: {driver_licence_number: body.driver_licence_number,},});
            if(checkLicenceNumber)
                return response.liteResponse(code.FAILURE, "Driver with this licence number already exist", null)

            let checkPhone = await UserModel.findFirst({where: {phone: body.phone,},});
            if(checkPhone)
                return response.liteResponse(code.FAILURE, "Driver with this phone already exist", null)

            let accountId = await this.VehicleCtrl.getAccoundId(request);
            if(!accountId){
                return response.liteResponse(code.FAILURE, 'Account not provided')
            }else{
                let regions = await RegionModel.findFirst({
                    where:{
                        account_id: accountId,
                        id: parseInt(region_id)
                    }
                })
                if(!regions)
                    return response.liteResponse(code.FAILURE, "Unknown region provided", null)

                //upload profile vehicle image
                let res: any = await this.uploadFile(image)
                const imagePaths: {path: string, height: number, width: number, size: number, format?: string} =
                    {
                        path: res.key,
                        height: res.metadata.height,
                        width: res.metadata.width,
                        size: res.metadata.size,
                        format: res.metadata.format
                    };
                // return response.liteResponse(5000, 'message', testSendMail)

                if(body.vehicle_principal_id && body.vehicle_interimaire_id)
                    return response.liteResponse(code.FAILURE, 'A driver can not a principal and interimaire',null)

                if(!body.vehicle_principal_id && !body.vehicle_interimaire_id)
                    return response.liteResponse(code.FAILURE, 'provide vehicle to this driver',null)

                let generatedPassword = this.generatePassword()
                //organize data
                let data: Prisma.UserCreateInput = {
                    first_name: body.first_name.toLowerCase(),
                    last_name: body.last_name.toLowerCase(),
                    email: body.email.toLowerCase(),
                    birthday: new Date(body.birthday),
                    place_Birth: body.place_Birth.toLowerCase(),
                    phone: body.phone,
                    cni_number: body.cni_number.toLowerCase(),
                    driver_licence_number : body.driver_licence_number.toLowerCase(),
                    driver_licence_type:  body.driver_licence_type.toLowerCase(),
                    country_licence_delivery:body.country_licence_delivery.toLowerCase(),
                    issue_delivery_on: new Date(body.issue_delivery_on),
                    expire_delivery_at: new Date(body.expire_delivery_at),
                    account: {connect: {id: accountId}},
                    city:{connect:{id: parseInt(body.city_id)}},
                    grade:{connect:{id: parseInt(body.grade_id)}},
                    region: {connect:{id: parseInt(body.region_id)}},
                    verified_at: new Date(),
                    password: bcrypt.hashSync(generatedPassword, 10),
                    role: {connect: { id: USER_ROLE.DRIVER}},
                    image:{create: imagePaths}
                }
                if(body.vehicle_principal_id){
                    data.vehicle_principal = { connect: { id: parseInt(body.vehicle_principal_id) }}
                }
                if(body.vehicle_interimaire_id){
                    data.vehicle_interimaire = { connect: { id: parseInt(body.vehicle_interimaire_id) } };
                }

                let createDriver = await UserModel.create({
                    data: data
                })
                if(!createDriver)
                    return response.liteResponse(code.FAILURE, "Error occurred, try again!",null)

                await this.sendMailFromTemplate({
                    to : createDriver.email,
                    modelName : "createdriver",
                    data : {
                        username: createDriver.first_name,
                        email: createDriver.email,
                        password: generatedPassword,
                    },
                    subject : "Creation de votre compte chauffeur"
                })
                return response.liteResponse(code.SUCCESS, 'Success !', createDriver)
            }
        }catch(e){
            console.log(e)
            return response.catchHandler(e)
        }

    }

}