import {Body, FormField, Path, Get, Post, Request, Route, Security, Tags, UploadedFiles, UploadedFile} from "tsoa";
import {AUTHORIZATION, IResponse, My_Controller} from "./controller";
import {ResponseHandler} from "../../src/config/responseHandler";
import code from "../../src/config/code";
import {PERMISSION} from "../models/permission";
import {VEHICLE_STATUS, VehicleModel} from "../models/vehicle";
import VehicleType from "../types/vehicleType";
import {brandSchema, modelSchema, vehicleCreateSchema, vehicleOwnerSchema} from "../validations/vehicle.validation";
import {brandModel} from "../models/brand";
import {carModel} from "../models/carmodel";
import express from "express";
import {UserModel} from "../models/user";
import {VehicleOwnerModel} from "../models/vehicleowner";
import {RegionModel} from "../models/regions";
import {VehicleTypeModel} from "../models/vehicle_type";
import {CarColorModel} from "../models/carcolor";
import {VehicleContractTypeModel} from "../models/vehicle_contract_type";
import {CurrencyModel} from "../models/currency";

const response = new ResponseHandler()

@Tags("Vehicle Controller")
@Route("/vehicle")

export class VehicleController extends My_Controller {
    @Security(AUTHORIZATION.TOKEN, [PERMISSION.READ_VEHICLE])
    @Get("/by/{region_id}")
    public async index(
        @Path() region_id: number,
        @Request() request: express.Request
    ): Promise<IResponse> {
        try {
            let accountId =  await this.getAccoundId(request)
            if(!accountId){
                return response.liteResponse(code.FAILURE, 'Account not provided')
            }else{
                let regions = await RegionModel.findFirst({
                    where:{
                        account_id: accountId,
                        id: region_id
                    }
                })
                if(!regions)
                    return response.liteResponse(code.FAILURE, 'regions not found', null)

                let found= await VehicleModel.findMany({
                    include: {
                        region: true,
                        vehicle_image: {
                            select: {
                                path: true
                            }
                        },
                        owner: true,
                        color: true,
                        brand: true,
                        model: true,
                        images_presentation: {
                            select: {
                                path: true
                            }
                        }
                    },
                    where : {
                        region_id,
                    }
                });
                if(!found)
                    return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

                return response.liteResponse(code.SUCCESS, "Success !", found)
            }
        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ADD_VEHICLE])
    @Post("")
    public async addVehicle(
        @UploadedFiles() images: Express.Multer.File[],
        @FormField() chassis_number: string,
        @FormField() registration_number: string,
        @FormField() gps_number: string,
        @FormField() mileage: string,
        @FormField() daily_recipe: string,
        @FormField() insurance_subscription_at: Date,
        @FormField() circulation_at: Date,
        @FormField() entry_fleet_at: Date,
        @FormField() currency_id: string,
        @FormField() brand_id: string,
        @FormField() model_id: string,
        @FormField() color_id: string,
        @FormField() region_id: string,
        @FormField() vehicle_owner_id: string,
        @FormField() contract_type_id: string,
        @FormField() vehicle_type_id: string,
        @Request() request: express.Request
    ): Promise<IResponse> {
        try {
            let body = {
               chassis_number,
               registration_number,
               gps_number,
               mileage,
               daily_recipe,
               insurance_subscription_at,
               circulation_at,
               entry_fleet_at,
               currency_id,
               brand_id,
               model_id,
               color_id,
               region_id,
               vehicle_owner_id,
                contract_type_id,
                vehicle_type_id
            }
            const validate = this.validate(vehicleCreateSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            let accountId = await this.getAccoundId(request)

            if(!accountId){
                return response.liteResponse(code.FAILURE, 'Account not provided')
            }else{
                let verifyChassisNumber = await VehicleModel.findFirst({where:{chassis_number: body.chassis_number}})
                if(verifyChassisNumber) return response.liteResponse(code.FAILURE, 'Chassis number already exist')

                if(body.gps_number){
                    let gpsNumber = await VehicleModel.findFirst({where:{gps_number: body.gps_number}})
                    if(gpsNumber) return response.liteResponse(code.FAILURE, 'Gps number already exist')
                }

                let registrationNumber = await VehicleModel.findFirst({where:{registration_number: body.registration_number}})
                if(registrationNumber) return response.liteResponse(code.FAILURE, 'Registration number already exist')

                let regions = await RegionModel.findFirst({
                    where:{
                        account_id: accountId,
                        id: parseInt(region_id)
                    }
                })
                if(!regions)
                    return response.liteResponse(code.FAILURE, "Unknown region provided", null)


                //upload profile vehicle image
                let res: any[] = await this.uploadFile(images)
                const imagePaths: {path: string, height: number, width: number, size: number, format?: string}[] = res.map(image => (
                    {
                        path: image.Key,
                        height: image.metadata.height,
                        width: image.metadata.width,
                        size: image.metadata.size,
                        format: image.metadata.format
                    }));
                console.log(imagePaths)
                return response.liteResponse(5000, 'message', null)
                let create = await VehicleModel.create({
                    data: {
                        chassis_number: body.chassis_number.toLowerCase(),
                        registration_number: body.registration_number.toLowerCase(),
                        gps_number: body.gps_number.toLowerCase(),
                        mileage: parseInt(body.mileage),
                        status: VEHICLE_STATUS.AVAILABLE,
                        daily_recipe: parseInt(body.daily_recipe),
                        insurance_subscription_at: new Date(body.insurance_subscription_at),
                        circulation_at : new Date(body.circulation_at),
                        entry_fleet_at: new Date(body.entry_fleet_at),
                        currency:{connect:{id: parseInt(body.currency_id)}},
                        brand:{connect:{id: parseInt(body.brand_id)}},
                        model:{connect:{id: parseInt(body.model_id)}},
                        color: {connect:{id: parseInt(body.color_id)}},
                        region: {connect:{id: parseInt(body.region_id)}},
                        owner: {connect:{id: parseInt(body.vehicle_owner_id)}},
                        vehicle_type: {connect: {id: parseInt(body.vehicle_type_id)}},
                        contract_type: {connect:{id: parseInt(body.contract_type_id)}},
                        vehicle_image:{
                            create: {
                                path: res[0].key,
                                width: res[0].metadata.width,
                                height: res[0].metadata.height,
                                size: res[0].metadata.size,
                                format: res[0].metadata.format
                            }
                        },
                        images_presentation:{
                            create: imagePaths
                        }
                    }
                })
                if(!create)
                    return response.liteResponse(code.FAILURE, "Error occurred, try again!",null)
                return response.liteResponse(code.SUCCESS, 'Success !', create)
            }
        }catch(e){
            console.log(e)
            return response.catchHandler(e)
        }
    }

    @Post('/images')
    public async images(
        @UploadedFiles() images: Express.Multer.File[],
    ):Promise<IResponse> {
        try {
            console.log('images', images)
            let res: any[] = await this.uploadFile(images)
            const imagePaths: {path: string, metadata: any}[] = res.map(image => ({ path: image.Key , metadata: image.metadata}));
            console.log(imagePaths)
            return response.liteResponse(code.SUCCESS, 'success', imagePaths)
        }catch(e){
            return response.catchHandler(e)
        }
    }


    @Security(AUTHORIZATION.TOKEN)
    @Get("/brand")
    public async getBrand(
        @Request() request: express.Request
    ): Promise<IResponse> {
        try {
            let accountId =  await this.getAccoundId(request)
            if(!accountId){
                return response.liteResponse(code.FAILURE, 'Account not provided')
            }else{
                let found = await brandModel.findMany({
                    include:{
                        model: true,
                        account: true
                    },
                    where: {
                        account_id: accountId
                    }
                });
                if(!found)
                    return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

                return response.liteResponse(code.SUCCESS, "Success !", found )
            }

        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN)
    @Get("/vehicle-type")
    public async getVehicleType(
    ): Promise<IResponse> {
        try {
            let found = await VehicleTypeModel.findMany();
            if(!found)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "Success !", found )
        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN)
    @Get("/vehicle-contract-type")
    public async getVehicleContractType(
    ): Promise<IResponse> {
        try {
            let found = await VehicleContractTypeModel.findMany();
            if(!found)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "Success !", found )
        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN)
    @Get("/vehicle-color")
    public async getVehicleColor(
    ): Promise<IResponse> {
        try {
            let found = await CarColorModel.findMany();
            if(!found)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "Success !", found )
        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN)
    @Get("/currency")
    public async getCurrency(
    ): Promise<IResponse> {
        try {
            let found = await CurrencyModel.findMany();
            if(!found)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "Success !", found )
        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN)
    @Get("/model/{brand_id}")
    public async getModel(
        @Path() brand_id: number
    ): Promise<IResponse> {
        try {
            let found = await carModel.findMany({
                where: {
                    brand_id
                }
            });
            if(!found)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "Success !", found)
        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ADD_VEHICLE])
    @Post("/brand")
    public async createBrand(
        @Body() body: VehicleType.brandCreate,
        @Request() request: express.Request
    ): Promise<IResponse>{
        try {
            const validate = this.validate(brandSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            let accountId =  await this.getAccoundId(request)
            if(!accountId){
                return response.liteResponse(code.FAILURE, 'Account not provided')
            }else{
                let foundBrand = await brandModel.findMany({
                    where: {
                        account_id: accountId
                    },
                    select:{
                        name: true
                    }
                })
                let alreadyExist = foundBrand.some(item => item.name == body.name.toLowerCase())
                if(alreadyExist)
                    return response.liteResponse(code.FAILURE, "Brand already exist")
                let create = await brandModel.create({
                    data: {
                        name: body.name.toLowerCase(),
                        account:{
                            connect:{
                                id: accountId
                            }
                        }
                    }
                })
                if(!create)
                    return response.liteResponse(code.FAILURE, "error occurred, try again !")
                return response.liteResponse(code.SUCCESS, 'success',create)
            }
        }catch (e){
            console.log(e)
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ADD_VEHICLE])
    @Post("/model")
    public async createModel(
        @Body() body: VehicleType.modelCreateField,
    ): Promise<IResponse>{
        try {
            const validate = this.validate(modelSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)
            let foundBrand = await brandModel.findFirst({
                where: {
                    id: body.brand_id
                }
            })
            if(!foundBrand)
                return response.liteResponse(code.NOT_FOUND, "Brand not found")

            let foundModel = await carModel.findMany({
                where: {
                    brand_id: foundBrand.id
                },
                select:{
                    name: true
                }
            })
            let alreadyExist = foundModel.some(item => item.name == body.name.toLowerCase())
            if(alreadyExist)
                return response.liteResponse(code.FAILURE, "Model already exist")

            let create = await carModel.create({
                data: {
                    name: body.name.toLowerCase(),
                    brand:{
                        connect:{
                            id: body.brand_id
                        }
                    }
                }
            })
            if(!create)
                return response.liteResponse(code.FAILURE, "error occurred , try again !")
            return response.liteResponse(code.SUCCESS, 'success', create)
        }catch (e){
            console.log(e)
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ADD_VEHICLE])
    @Post("/vehicle-owner")
    public async createOwnerVehicleModel(
        @Body() body: VehicleType.vehicleOwnerCreateField,
        @Request() request: express.Request
    ): Promise<IResponse>{
        try {
            const validate = this.validate(vehicleOwnerSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            let accountId =  await this.getAccoundId(request)
            if(!accountId){
                return response.liteResponse(code.FAILURE, 'Account not provided')
            }else{
                let foundVehicleOwner = await VehicleOwnerModel.findMany({
                    where: {
                        account_id: accountId
                    },
                    select:{
                        cni_number: true
                    }
                })
                let alreadyExist = foundVehicleOwner.some(item => item.cni_number == body.cni_number.toLowerCase())
                if(alreadyExist)
                    return response.liteResponse(code.FAILURE, "Already exist")
                let create = await VehicleOwnerModel.create({
                    data: {
                        first_name: body.first_name.toLowerCase(),
                        last_name: body.last_name.toLowerCase(),
                        cni_number: body.cni_number.toLowerCase(),
                        driver_licence_number: body.driver_licence_number,
                        account:{
                            connect:{
                                id: accountId
                            }
                        }
                    }
                })
                if(!create)
                    return response.liteResponse(code.FAILURE, "error occured , try again !")
                return response.liteResponse(code.SUCCESS, 'success',create)
            }
        }catch (e){
            console.log(e)
            return response.catchHandler(e)
        }
    }
    @Security(AUTHORIZATION.TOKEN)
    @Get("/vehicle-owner")
    public async getVehicleOwner(
        @Request() request: express.Request
    ): Promise<IResponse> {
        try {
            let accountId =  await this.getAccoundId(request)
            if(!accountId){
                return response.liteResponse(code.FAILURE, 'Account not provided')
            }else{
                let found = await VehicleOwnerModel.findMany({
                    include:{
                        account: true
                    },where:{
                        account_id: accountId
                    }
                });
                if(!found)
                    return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)
                return response.liteResponse(code.SUCCESS, "Success !", found)
            }
        }catch(e){
            return response.catchHandler(e)
        }
    }

    public async getAccoundId(request: express.Request): Promise<string | null> {

        let user = await this.getUserId(request.headers.authorization);
        let profile = await UserModel.findFirst({
            where: {
                id: user.userId
            },
            include: {
                hisAcount: {
                    select: {
                        id: true,
                    }
                }
            }
        })
        if(!profile)
            return response.liteResponse(code.FAILURE, 'profile not found')

        return  profile.hisAcount !== null ? profile.hisAcount.id : profile.account_id !== null ? profile.account_id : null
    }

}