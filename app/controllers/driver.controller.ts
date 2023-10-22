import {Body, Get, Post, Route, Tags, Security, Request} from "tsoa";
import {  IResponse, My_Controller } from "./controller";
import UserType from "../types/userType";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {userCreateSchema} from "../validations/user.validation";
import {AUTHUSER, SALT_ROUND, UserModel} from "../models/user";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import {USER_ROLE} from "../models/role";
import {TokenModel} from "../models/token";
import { UserPermissionModel, right_permission } from "../models/user_permission";
import { PERMISSION } from "../models/permission";
const response = new ResponseHandler()

@Tags("Driver Controller")
@Route("/driver")

export class DriverController extends My_Controller {
    @Security("Jwt", [PERMISSION.READ_DRIVER])
    @Get("")
    public async index(
    ): Promise<IResponse> {
        try {
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

    @Post("")
    @Security('jwt', [PERMISSION.ADD_DRIVER])
    public async createDriver(
        @Body() body: UserType.userCreateFields
    ): Promise<IResponse>{
        try {
            const validate = this.validate(userCreateSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            let userData : any = body
            let savedRole = body.role;
            let savedPassword = body.password
            userData['password'] = await bcrypt.hash(body.password, SALT_ROUND)
			userData['verified_at'] = new Date()
			delete userData.role

            //Check if email already exist
            console.log("Check Email...")
            const verifyEmail = await UserModel.findFirst({where:{email : body.email}})
            if(verifyEmail)
                return response.liteResponse(code.FAILURE, "Email already exist, Try with another email")
            console.log("Check Email finished")

            const roleId = this.sanityzeRole(savedRole)
			const user = await UserModel.create({data : {
					...userData,
					role : {connect : {id: roleId}},
				}})
            if (!user)
                return response.liteResponse(code.FAILURE, "An error occurred, on user creation. Retry later!", null)

            await UserPermissionModel.createMany({
				data : right_permission(savedRole).map(
					itm => ({permission_id : itm, user_id : user.id})
				)})

				// this.sendMailFromTemplate({
				// 	to : user.email,
				// 	modelName : "createuser",
				// 	data : {
				// 		username: user.username,
				// 		password : savedPassword,
				// 		token: tokenUser,
				// 		connexion: `${process.env.FRONT_URL}loginuser?username=${user.username}&password=${savedPassword}&token=${tokenUser}`
				// 	},
				// 	subject : "Created Account"
				// })

            console.log("Create user Success")
            return response.liteResponse(code.SUCCESS, "User registered with Success !", user)
        }catch (e){
            return response.catchHandler(e)
        }
    }

}