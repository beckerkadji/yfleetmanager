import {Body, Get, Post, Route, Tags, Security, Request} from "tsoa";
import {  IResponse, My_Controller } from "./controller";
import UserType from "../types/userType";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {resetPasswordSchema, userCreateSchema} from "../validations/user.validation";
import {AUTHUSER, SALT_ROUND, UserModel} from "../models/user";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import {USER_ROLE} from "../models/role";
import {TokenModel} from "../models/token";
import { UserPermissionModel, right_permission } from "../models/user_permission";
import { PERMISSION } from "../models/permission";
import { randomInt } from "crypto";
import { otpModel } from "../models/otp";
const response = new ResponseHandler()

@Tags("Auth Controller")
@Route("/")

export class AuthController extends My_Controller {

    @Post('login')
    public async login(
        @Body() body : UserType.loginFields
    ) : Promise<IResponse> {
        try {
            //found user
            const foundUser = await UserModel.findFirst({where: {email: body.email}})
            if(!foundUser)
                return response.liteResponse(code.NOT_FOUND, 'User not found, Invalid email or password !')

            //Compare password
            const compare = bcrypt.compareSync(body.password, foundUser.password)
            if(!compare){
                return response.liteResponse(code.FAILURE, "Invalid password. Try again !")
            }
            else {

                // Create generate token
                const payload : any = {
                    userId : foundUser.id,
                    email : foundUser.email
                }

                const token = jwt.sign(payload, <string>process.env.SECRET_TOKEN, { expiresIn: '1d'})
                const decode: any = jwt.decode(token)
                //Create token for this user
                const createToken = await TokenModel.create({data : {
                    userId: foundUser.id,
                        jwt: token,
                        expireIn : decode.exp
                    }, select : {
                        jwt: true,
                    }})
                const jwtToken : any = createToken.jwt
                return response.liteResponse(code.SUCCESS, "Sucess request login", {...foundUser, token: jwtToken})
            }  
        }
        catch (e){
            return response.catchHandler(e)
        }
    }

    @Post('forgot_password')
    public async forgotPassword(
        @Body() body : UserType.forgotPasswordFields
    ): Promise<IResponse> {
        try {
            //found user
            const foundUser = await UserModel.findFirst({where: {phone: body.phone}})
            if(!foundUser)
                return response.liteResponse(code.NOT_FOUND, 'User not found with this phone number')
                let otp = this.generate_otp()
                const createOtp = await otpModel.create({
                    data: {
                        otp: otp,
                        expiredIn: (Math.round(new Date().getTime()/ 1000)) + 300, // expired after 5 minutes
                        userEmail : foundUser.email
                    }
                })
                let res = await this.sendMailFromTemplate({
					to : foundUser.email,
					modelName : "forgotpassword",
					data : {
						otp : otp,
                        email: foundUser.email
					},
					subject : "OTP CODE "
				})
                if(res.response.status !== 200)
                    return response.liteResponse(code.FAILLURE, "error occured when sending otp, Try again !", null)

                return response.liteResponse(code.SUCCESS, "Verify OTP CODE", {otp, email: foundUser.email})
            }
            catch (e){
                return response.catchHandler(e)
            }
    }

    @Post("verify-otp")
    public async verifyOtp(
        @Body() body: UserType.verifyOtp
    ) : Promise<IResponse> {
        try{
            const foundUser: any = await UserModel.findFirst({where: {email: body.email}})
            if(!foundUser)
            return response.liteResponse(code.NOT_FOUND, 'User not found, Invalid email !')

            let foundOtp = await otpModel.findFirst({
                where:{
                    otp: body.otp,
                    userEmail: body.email
                }
            })
            if(!foundOtp)
                return response.liteResponse(code.NOT_FOUND, "Incorrect otp, try again !")
    
            //Check if otp is expired
            if(foundOtp.expiredIn < Math.round(new Date().getTime() / 1000))
                return response.liteResponse(code.FAILURE, "This otp is expired. Resend otp !")

    
            return response.liteResponse(code.SUCCESS, "Success request !", {email: foundUser.email})
        }catch(e){
            return response.catchHandler(e)
        }
        
    }

    @Post('resent-otp')
    public async resendotp(
        @Body() body : UserType.resendOtp
    ): Promise<IResponse>{
        try{
            const foundUser: any = await UserModel.findFirst({where: {email: body.email}})
            if(!foundUser)
            return response.liteResponse(code.NOT_FOUND, 'User not found, Invalid email')

            let otp = this.generate_otp()
            //delete all previous send otp wich is'nt expired
            await otpModel.deleteMany({
                where:{
                    userEmail: body.email,
                    expiredIn:{
                        gt: Math.round(new Date().getTime()/ 1000)
                    }
                }
            })
            const createOtp = await otpModel.create({
                data: {
                    otp: otp,
                    expiredIn: (Math.round(new Date().getTime()/ 1000)) + 300, // expired after 5 minutes
                    userEmail : body.email
                }
            })
            // send mail
            let res = await this.sendMailFromTemplate({
                to : foundUser.email,
                modelName : "forgotpassword",
                data : {
                    otp : otp,
                    email: foundUser.email
                },
                subject : "OTP CODE "
            })

            if(res.response.status !== 200)
                return response.liteResponse(code.FAILLURE, "error occured when sending otp, Try again !")

            return response.liteResponse(code.SUCCESS, "OTP code is resent",{otp : createOtp.otp})
        }catch(e){
            return response.catchHandler(e)
        }
        
    }

    @Post('reset_password')
    public async resetPassword(
        @Body() body : UserType.resetPasswordFields
    ): Promise<IResponse> {
        try {
            const validate = this.validate(resetPasswordSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            //found user
            const foundUser = await UserModel.findFirst({where: {email: body.email}})
            if(!foundUser)
                return response.liteResponse(code.NOT_FOUND, 'User not found, Invalid email!')

            let update = await UserModel.update(
                { 
                    data: {
                        password: bcrypt.hashSync(body.password, SALT_ROUND)
                    },
                    where: {
                        id: foundUser.id
                    }
                }
            )
            if(!update)
                return response.liteResponse(code.FAILLURE, 'Something went wrong, try Again !', null);

            return response.liteResponse(code.SUCCESS, "Your password is updated", null);
         }
        catch (e){
            return response.catchHandler(e)
        }
    }

    // @Post("register")
    // public async register(
    //     @Body() body: UserType.userCreateFields
    // ): Promise<IResponse>{
    //     try {
    //         const validate = this.validate(userCreateSchema, body)
    //         if(validate !== true)
    //             return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

    //         let userData : any = body
    //         let savedRole = body.role;
    //         let savedPassword = body.password
    //         userData['password'] = await bcrypt.hash(body.password, SALT_ROUND)
	// 		userData['verified_at'] = new Date()
	// 		delete userData.role

    //         //Check if email already exist
    //         console.log("Check Email...")
    //         const verifyEmail = await UserModel.findFirst({where:{email : body.email}})
    //         if(verifyEmail)
    //             return response.liteResponse(code.FAILURE, "Email already exist, Try with another email")
    //         console.log("Check Email finished")

    //         const roleId = this.sanityzeRole(savedRole)
	// 		const user = await UserModel.create({data : {
	// 				...userData,
	// 				role : {connect : {id: roleId}},
	// 			}})
    //         if (!user)
    //             return response.liteResponse(code.FAILURE, "An error occurred, on user creation. Retry later!", null)

    //         await UserPermissionModel.createMany({
	// 			data : right_permission(savedRole).map(
	// 				itm => ({permission_id : itm, user_id : user.id})
	// 			)})

	// 			// this.sendMailFromTemplate({
	// 			// 	to : user.email,
	// 			// 	modelName : "createuser",
	// 			// 	data : {
	// 			// 		username: user.username,
	// 			// 		password : savedPassword,
	// 			// 		token: tokenUser,
	// 			// 		connexion: `${process.env.FRONT_URL}loginuser?username=${user.username}&password=${savedPassword}&token=${tokenUser}`
	// 			// 	},
	// 			// 	subject : "Created Account"
	// 			// })

    //         console.log("Create user Success")
    //         return response.liteResponse(code.SUCCESS, "User registered with Success !", user)
    //     }catch (e){
    //         return response.catchHandler(e)
    //     }
    // }

    @Get('logout')
    @Security("Jwt")
    public async logout(
        @Request() req : any
    ): Promise<IResponse> {
        try {
            const token = await TokenModel.findFirst({where: {jwt : req.headers['authorization']}})
            if(!token)
                return response.liteResponse(code.FAILURE, "Token not found",null)

            let expirate  = Math.round((new Date().getTime() / 1000) / 2)
            await TokenModel.update({where : {id: token.id}, data: {
                    expireIn: expirate,
                }})
            return response.liteResponse(code.SUCCESS, "Logout with success !", null)
        }catch (e){
            return response.catchHandler(e)
        }
    }
}