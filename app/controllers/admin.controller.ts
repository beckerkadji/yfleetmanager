import {Body, Get, Post, Route, Tags, Security} from "tsoa";
import {  AUTHORIZATION, IResponse, My_Controller } from "./controller";
import UserType from "../types/userType";
import bcrypt from "bcryptjs"
import {adminCreateSchema, userCreateSchema} from "../validations/user.validation";
import { SALT_ROUND, UserModel} from "../models/user";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import { ROLE_HR, USER_ROLE} from "../models/role";
import { UserPermissionModel, right_permission } from "../models/user_permission";
import { PERMISSION } from "../models/permission";
import { accountModel } from "../models/account";
import { AuthController } from "./auth.controller";
const response = new ResponseHandler()

@Tags("Admin Controller")
@Route("/admin")

export class AdminController extends My_Controller {
    private authCtrl = new AuthController()

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ALL_PERMISSION])
    @Get("")
    public async index(
    ): Promise<IResponse> {
        try {
            let findUser = await UserModel.findMany({
                include : {
                    role: true,
                    childs: true,
                    permissions: true
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

    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ALL_PERMISSION])
    @Post("")
    public async createAdmin(
        @Body() body: UserType.adminCreateFields
    ): Promise<IResponse>{
        try {
            const validate = this.validate(adminCreateSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            let userData : any = body
            let savedPassword = this.generatePassword()
            userData['password'] = await bcrypt.hash(savedPassword, SALT_ROUND)
			delete userData.role

            //Check if email already exist
            console.log("Check Email...")
            const verifyEmail = await UserModel.findFirst({where:{email : body.email}})
            if(verifyEmail)
                return response.liteResponse(code.FAILURE, "Email already exist, Try with another email")
            console.log("Check Email finished")

            //create Account
            let account = await accountModel.create({ data: {}})
            if (!account)
                return response.liteResponse(code.FAILURE, "An error occurred, on user creation. Retry later!", null)

            const roleId = this.sanityzeRole(ROLE_HR.ROOT)
            console.log('role id ',roleId)
			const user = await UserModel.create({data : {
					...userData,
					role : {connect : {id: roleId}},
                    account: {connect: {id: account.id}}
				}})
            console.log('user',user)

            if (!user)
                return response.liteResponse(code.FAILURE, "An error occurred, on user creation. Retry later!", null)

            //generate token
            let tokenUser = await this.authCtrl.generate_token(user.id, user.email);

            await UserPermissionModel.createMany({
				data : right_permission(ROLE_HR.ADMIN).map(
					itm => ({permission_id : itm, user_id : user.id})
				)})

				this.sendMailFromTemplate({
					to : user.email,
					modelName : "createuser",
					data : {
						username: user.first_name,
						password : savedPassword,
                        token: tokenUser,
						connexion: `${process.env.FRONT_URL}loginuser?usrn=${user.first_name}&tkn=${tokenUser}`
					},
					subject : "Created Account"
				})


            console.log("Create admin with Success")
            return response.liteResponse(code.SUCCESS, "Account created with Success !", user)
        }catch (e){
            console.log(e)
            return response.catchHandler(e)
        }
    }
}