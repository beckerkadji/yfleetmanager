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
import { AuthController } from "./auth.controller";
import express from "express";
import AccountType from "../types/accountType";
import {accountModel} from "../models/account";
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
            const validate = this.validate(adminCreateSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            let user = await this.getUserId(request.headers.authorization);
            let profile = await UserModel.findFirst({
                where: {
                    id: user.userId
                },
                include: {
                    regions: true,
                    hisAcount: {
                        select: {
                            id: true,
                            regions:{
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            })
            if(!profile){
                return response.liteResponse(code.FAILURE, "error occurred ! unknow profile")
            }else{
                if(profile.hisAcount){
                    //Check if email already exist
                    console.log("Check Email...")
                    const verifyEmail = await UserModel.findFirst({where:{email : body.email}})
                    if(verifyEmail)
                        return response.liteResponse(code.FAILURE, "Email already exist, Try with another email")

                    let userData : any = body
                    let savedPassword = this.generatePassword()
                    userData['password'] = await bcrypt.hash(savedPassword, SALT_ROUND)
                    let assign_regions = body.assign_regions;
                    let accound_id = profile.hisAcount.id
                    let profileRegions = profile.hisAcount.regions;
                    delete userData.role
                    delete userData.assign_regions
                    delete userData.account_id

                    console.log('profile regions', profileRegions)
                    console.log('body region provide', assign_regions)

                    const regionsExist = assign_regions.every(regionId => {
                        return profileRegions.some(profileRegion => profileRegion.id === regionId);
                    });
                    if (regionsExist) {
                        const roleId = this.sanityzeRole(ROLE_HR.ADMIN)
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

                        if (!admin)
                            return response.liteResponse(code.FAILURE, "An error occurred, on user creation. Retry later!", null)

                        //generate token
                        let tokenUser = await this.authCtrl.generate_token(admin.id, admin.email);

                        await UserPermissionModel.createMany({
                            data : right_permission(ROLE_HR.ADMIN).map(
                                itm => ({permission_id : itm, user_id : admin.id})
                            )})

                        let res = await this.sendMailFromTemplate({
                            to : admin.email,
                            modelName : "createuser",
                            data : {
                                username: admin.first_name,
                                connexion: `${process.env.FRONT_URL}loginuser?usrn=${admin.first_name}&tkn=${tokenUser}?email=${admin.email}`
                            },
                            subject : "Creation de compte"
                        })

                        console.log("Create admin with Success")
                        return response.liteResponse(code.SUCCESS, "Account created with Success !", admin)
                    } else {
                        return response.liteResponse(code.FAILURE, "unknown region provided !",)
                    }
                }else{
                    return response.liteResponse(code.NOT_AUTHORIZED, "Not authorized")
                }
            }
        }catch (e){
            console.log(e)
            return response.catchHandler(e)
        }
    }


    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ADD_ADMIN])
    @Post("/verify")
    public async verify(
        @Body() body: AccountType.verifyOwnerAccount
    ): Promise<IResponse>{
        try {
            console.log("Check Email...")
            let findAccount = await UserModel.findFirst({
                where: {
                    email: body.email
                }
            });
            if(!findAccount)
                return response.liteResponse(code.FAILURE, "User not found with this email")

            //generate token connexion email for this owner
            let tokenUser = await this.authCtrl.generate_token(findAccount.id, findAccount.email);

            let res = await this.sendMailFromTemplate({
                to : findAccount.email,
                modelName : "createuser",
                data : {
                    username: findAccount.first_name,
                    connexion: `${process.env.FRONT_URL}loginuser?usrn=${findAccount.first_name}&tkn=${tokenUser}`
                },
                subject : "Validation de compte"
            })
            return response.liteResponse(code.SUCCESS, "Verification email send to this account", {...findAccount, mail: res.body})

        }catch (e){
            console.log(e)
            return response.catchHandler(e)
        }
    }
}