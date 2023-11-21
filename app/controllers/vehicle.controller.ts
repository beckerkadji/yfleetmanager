import {Body, Get, Post, Route, Tags, Security, Request} from "tsoa";
import {  AUTHORIZATION, IResponse, My_Controller } from "./controller";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import { PERMISSION } from "../models/permission";
import {VehicleModel} from "../models/vehicle";
import VehicleType from "../types/vehicleType";
import {brandSchema, modelSchema} from "../validations/vehicle.validation";
import {brandModel} from "../models/brand";
import {carModel} from "../models/carmodel";
import express from "express";
import {UserModel} from "../models/user";
const response = new ResponseHandler()

@Tags("Vehicle Controller")
@Route("/vehicle")

export class VehicleController extends My_Controller {
    @Security(AUTHORIZATION.TOKEN, [PERMISSION.READ_VEHICLE])
    @Get("")
    public async index(
    ): Promise<IResponse> {
        try {
            let listVehicle = await VehicleModel.findMany();
            if(!listVehicle)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "Success !", listVehicle)
        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.READ_VEHICLE])
    @Post("/vehicle")
    public async addVehicle(
        @Body() body: VehicleType.vehicleCreateFields
    ): Promise<IResponse> {
        try {
            let listVehicle = await VehicleModel.findMany();
            if(!listVehicle)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "Success !", listVehicle)
        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN)
    @Get("/brand")
    public async getBrand(
    ): Promise<IResponse> {
        try {
            let found = await brandModel.findMany({
                include:{
                    model: true,
                    account: true
                }
            });
            if(!found)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "Success !", found)
        }catch(e){
            return response.catchHandler(e)
        }
    }

    @Security(AUTHORIZATION.TOKEN)
    @Get("/model")
    public async getModel(
    ): Promise<IResponse> {
        try {
            let found = await carModel.findMany();
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

            let accountId = profile.hisAcount !== null ? profile.hisAcount.id : profile.account_id !== null? profile.account_id: null

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
                    return response.liteResponse(code.FAILURE, "error occured , try again !")
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

}