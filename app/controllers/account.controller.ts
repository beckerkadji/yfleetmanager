import {Body, Get, Post, Route, Tags, Security} from "tsoa";
import {  AUTHORIZATION, IResponse, My_Controller } from "./controller";
import bcrypt from "bcryptjs"
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import { ROLE_HR } from "../models/role";
import { accountModel } from "../models/account";
import { AuthController } from "./auth.controller";
import {PERMISSION} from "../models/permission";
import AccountType from "../types/accountType";
import {accountCreateSchema} from "../validations/account.validation";
import {SALT_ROUND, UserModel} from "../models/user";
import {right_permission, UserPermissionModel} from "../models/user_permission";

const response = new ResponseHandler()

@Tags("Account Controller")
@Route("/account")

export class AccountController extends My_Controller {
    private authCtrl = new AuthController()

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ALL_PERMISSION])
    @Get("")
    public async index(
    ): Promise<IResponse> {
        try {
            let findAccount = await accountModel.findMany({
                include: {
                    owner: true,
                    regions: {
                        include: {
                            users: true
                        }
                    }
                }
            });
            if(!findAccount)
                return response.liteResponse(code.FAILD, "Error occurred during Finding ! Try again", null)

            return response.liteResponse(code.SUCCESS, "Success !", findAccount)
        }catch(e){
            return response.catchHandler(e)
        }

    }

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ALL_PERMISSION])
    @Post("/create")
    public async createAccount(
        @Body() body: AccountType.accountCreateFields
    ): Promise<IResponse>{
        try {
            const validate = this.validate(accountCreateSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            //Check if email already exist
            console.log("Check Email...")
            const verifyEmail = await UserModel.findFirst({where:{email : body.owner.email}})
            if(verifyEmail)
                return response.liteResponse(code.FAILURE, "Email already exist, Try with another email")

            console.log("Check Phone...")
            const verifyPhone = await UserModel.findFirst({where:{phone : body.owner.phone}})
            if(verifyPhone)
                return response.liteResponse(code.FAILURE, "Phone already exist, Try with another phone")

            let userData : any = body.owner
            let savedPassword = this.generatePassword()
            userData['password'] = await bcrypt.hash(savedPassword, SALT_ROUND)
            delete userData.role

            const roleId = this.sanityzeRole(ROLE_HR.OWNER)

            //create Account
            let account = await accountModel.create({
                data : {
                    regions:{
                        createMany: {
                            data: body.regions
                        }
                    },
                    owner: {
                        create: {
                            ...userData,
                            role : {connect : {id: roleId}},
                        }
                    }
                },
                select : {
                    owner: {
                        select:{
                            id: true,
                            email: true,
                            first_name: true
                        }
                    },
                    regions: true
                }
            })
            if (!account){
                return response.liteResponse(code.FAILURE, "An error occurred, on user creation. Retry later!", null)
            }else {

                //generate token connexion email for this owner
                let tokenUser = await this.authCtrl.generate_token(account.owner.id, account.owner.email);

                await UserPermissionModel.createMany({
                    data : right_permission(ROLE_HR.OWNER).map(
                        itm => ({permission_id : itm, user_id : account.owner.id})
                    )})

                let res = await this.sendMailFromTemplate({
                    to : account.owner.email,
                    modelName : "createuser",
                    data : {
                        username: account.owner.first_name,
                        connexion: `${process.env.FRONT_URL}loginuser?usrn=${account.owner.first_name}&tkn=${tokenUser}&email=${account.owner.email}`
                    },
                    subject : "Creation de compte"
                })

                console.log(res.body)
                console.log("Create admin with Success")
                return response.liteResponse(code.SUCCESS, "Account created with Success !", {account, token: tokenUser })
            }

        }catch (e){
            console.log(e)
            return response.catchHandler(e)
        }
    }


    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ALL_PERMISSION])
    @Post("/verify")
    public async verify(
        @Body() body: AccountType.verifyOwnerAccount
    ): Promise<IResponse>{
        try {
            console.log("Check Email...")
            let findAccount = await accountModel.findFirst({
                where: {
                    owner:{
                        email: body.email
                    }
                },
                select: {
                    owner:{
                        select: {
                            id: true,
                            email: true,
                            account_id: true,
                            first_name: true
                        }
                    }
                }
            });
            if(!findAccount)
                return response.liteResponse(code.FAILURE, "Account not found with this email")

            //generate token connexion email for this owner
            let tokenUser = await this.authCtrl.generate_token(findAccount.owner.id, findAccount.owner.email);

            let res = await this.sendMailFromTemplate({
                to : findAccount.owner.email,
                modelName : "createuser",
                data : {
                    username: findAccount.owner.first_name,
                    connexion: `${process.env.FRONT_URL}loginuser?usrn=${findAccount.owner.first_name}&tkn=${tokenUser}&email=${findAccount.owner.email}`
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