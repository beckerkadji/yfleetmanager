import {Body, Get, Post, Route, Tags, Security, UploadedFiles, FormField, Request, UploadedFile} from "tsoa";
import {AUTHORIZATION, IResponse, My_Controller} from "./controller";
import UserType from "../types/userType";
import bcrypt from "bcryptjs"
import {adminCreateSchema, userCreateSchema} from "../validations/user.validation";
import {SALT_ROUND, UserModel} from "../models/user";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import {USER_ROLE} from "../models/role";
import { UserPermissionModel, right_permission } from "../models/user_permission";
import { PERMISSION } from "../models/permission";
import express from "express";
import {vehicleCreateSchema} from "../validations/vehicle.validation";
import {driverCreateSchema} from "../validations/driver.validation";
import {string} from "joi";
const response = new ResponseHandler()

@Tags("Driver Controller")
@Route("/driver")

export class DriverController extends My_Controller {
    @Security(AUTHORIZATION.TOKEN, [PERMISSION.READ_DRIVER])
    @Get("")
    public async index(): Promise<IResponse> {
        try {
            let findDriver = await UserModel.findMany({
                where: {
                    roleId: USER_ROLE.DRIVER
                }
            })
            if(!findDriver)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "User found with success !", findDriver)
        }catch(e){
            return response.catchHandler(e)
        }

    }

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.READ_DRIVER])
    @Post("")
    public async addDrivers(
        @UploadedFile() image: Express.Multer.File,
        @FormField() first_name: string,
        @FormField() last_name: string,
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
        @FormField() regionId: string,
        @FormField() brand_id: string,
        @FormField() model_id: string,
        @FormField() Vehicle_principal_id: string,
        @Request() request: express.Request
    ): Promise<IResponse> {
        try {
            let body = {
                first_name,
                last_name,
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
                regionId,
                Vehicle_principal_id,
            }
            const validate = this.validate(driverCreateSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)
            let findUser = await UserModel.findMany({
                where: {
                    roleId: USER_ROLE.DRIVER
                },
                include : {
                    role: true,
                    childs: true,
                }
            });
            if(!findUser)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "User found with success !", findUser)
        }catch(e){
            return response.catchHandler(e)
        }

    }

}