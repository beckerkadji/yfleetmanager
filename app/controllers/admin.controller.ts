import {Body, Get, Post, Route, Tags, Security, Request} from "tsoa";
import {  AUTHORIZATION, IResponse, My_Controller } from "./controller";
import UserType from "../types/userType";
import bcrypt from "bcryptjs"
import { adminCreateSchema } from "../validations/user.validation";
import { SALT_ROUND, UserModel} from "../models/user";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import { ROLE_HR, USER_ROLE} from "../models/role";
import { UserPermissionModel, right_permission } from "../models/user_permission";
import { PERMISSION } from "../models/permission";
import { accountModel } from "../models/account";
import { AuthController } from "./auth.controller";
import {regionModel} from "../models/regions";
import express from "express";
import {adminRegionModel} from "../models/admin_region";
const response = new ResponseHandler()

@Tags("Admin Controller")
@Route("/admin")

export class AdminController extends My_Controller {
    private authCtrl = new AuthController()

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.READ_ADMIN])
    @Get("")
    public async index(
    ): Promise<IResponse> {
        try {
            let findUser = await UserModel.findMany({
                include : {
                    role: true,
                    childs: true,
                    permissions: {
                        select:{
                            permission_id: true
                        }
                    },
                    regions: true
                },
                where: {
                    roleId : USER_ROLE.ADMIN
                }
            });
            if(!findUser)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "User found with success !", findUser)
        }catch(e){
            return response.catchHandler(e)
        }

    }

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ADD_ADMIN])
    @Post("")
    public async createAdmin(
        @Body() body: UserType.adminCreateFields,
        @Request() request: express.Request
    ): Promise<IResponse>{
        try {
            let user = await this.getUserId(request.headers.authorization);

            const validate = this.validate(adminCreateSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            //Check if email already exist
            console.log("Check Email...")
            const verifyEmail = await UserModel.findFirst({where:{email : body.email}})
            if(verifyEmail)
                return response.liteResponse(code.FAILURE, "Email already exist, Try with another email")


            //Check if account exist and if user is on this account
            // const verifyAccount = await accountModel.findFirst({
            //     where:{
            //         id : body.account_id,
            //         users: {
            //             some: {
            //                 id: user.userId
            //             }
            //         }
            //     },
            // })
            // if(verifyAccount)
            //     return response.liteResponse(code.FAILURE, "Account not found or not authorization for this account")


            let userData : any = body
            let savedPassword = this.generatePassword()
            userData['password'] = await bcrypt.hash(savedPassword, SALT_ROUND)
            let assign_regions = body.assign_regions;
            let accound_id = body.account_id
			delete userData.role
            delete userData.assign_regions
            delete userData.account_id



            const roleId = this.sanityzeRole(ROLE_HR.ADMIN)
            console.log('body', body)
            console.log('userdata', userData)
			const admin = await UserModel.create({data : {
					...userData,
					role : {connect : {id: roleId}},
                    account: {
                        connect: {id: accound_id }
                    },
                    regions: {
                        connect: assign_regions.map(regionId => ({
                            id: regionId
                        }))
                    },
				}})
            console.log('admin', admin)

            if (!admin)
                return response.liteResponse(code.FAILURE, "An error occurred, on user creation. Retry later!", null)

            //generate token
            let tokenUser = await this.authCtrl.generate_token(admin.id, admin.email);

            await UserPermissionModel.createMany({
				data : right_permission(ROLE_HR.ADMIN).map(
					itm => ({permission_id : itm, user_id : admin.id})
				)})

				this.sendMailFromTemplate({
					to : admin.email,
					modelName : "createuser",
					data : {
						username: admin.first_name,
						password : savedPassword,
                        token: tokenUser,
						connexion: `${process.env.FRONT_URL}loginuser?usrn=${admin.first_name}&tkn=${tokenUser}`
					},
					subject : "Created Account"
				})


            console.log("Create admin with Success")
            return response.liteResponse(code.SUCCESS, "Account created with Success !", admin)
        }catch (e){
            console.log(e)
            return response.catchHandler(e)
        }
    }
}