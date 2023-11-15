import {Body, Get, Post, Route, Tags, Security, Request} from "tsoa";
import {  IResponse, My_Controller } from "./controller";
import UserType from "../types/userType";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {resetPasswordSchema, verifiedUserSchema} from "../validations/user.validation";
import {SALT_ROUND, UserModel} from "../models/user";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import {TokenModel} from "../models/token";
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
            const foundUser = await UserModel.findFirst({
                where: {email: body.email},include: {
                    hisAcount: true, permissions: { select: { permission_id: true}}
                }})
            if(!foundUser)
                return response.liteResponse(code.NOT_FOUND, 'User not found with this email!')

            if(!foundUser.verified_at)
                return response.liteResponse(code.FAILURE, 'User not verified yet ! contact administrator', null)

            //Compare password
            const compare = bcrypt.compareSync(body.password, foundUser.password)
            if(!compare){
                return response.liteResponse(code.FAILURE, "Invalid password. Try again !")
            }
            else {
                // Create generate token
                const jwtToken = await this.generate_token(foundUser.id, foundUser.email)
                return response.liteResponse(code.SUCCESS, "Sucess request login", {...foundUser, token: jwtToken})
            }  
        }
        catch (e){
            return response.catchHandler(e)
        }
    }

    @Post('loginuser')
    public async loginuser(
        @Body() body : UserType.verifiedFields
    ) : Promise<IResponse> {
        try {
            const validate = this.validate(verifiedUserSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            //found user
            const foundUser = await UserModel.findFirst({
                where : {
                    email: body.email,
                    token: {
                        some: {
                            jwt: body.token
                        },
                    }
                }
            })
            if(!foundUser)
                return response.liteResponse(code.NOT_FOUND, 'Incorrect token or username!')
            else {
                let updatePassword = await UserModel.update({
                    data: {
                        verified_at: new Date(),
                        password: await bcrypt.hash(body.new_password, SALT_ROUND),
                    },
                    where: {
                        email: body.email,
                    },
                })
                
                return response.liteResponse(code.SUCCESS, "Password updated with success ", updatePassword)
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

            if(!foundUser) {
                return response.liteResponse(code.NOT_FOUND, 'User not found with this phone number')
            } else {

                if(!foundUser.verified_at)
                    return response.liteResponse(code.FAILURE, 'User not verified yet ! contact administrator', null)

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
					subject : "OTP CODE"
				})
                if(res.response.status !== 200)
                    return response.liteResponse(code.FAILLURE, "error occured when sending otp, Try again !", null)

                return response.liteResponse(code.SUCCESS, "Verify OTP CODE", {otp, email: foundUser.email})

            }

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

    public async generate_token(user_id: string, email: string): Promise<string> {

        const payload : any = {
            userId : user_id,
            email : email
        }

        const tokenc = jwt.sign(payload, <string>process.env.SECRET_TOKEN, { expiresIn: '1d'})
        const decode: any = jwt.decode(tokenc)

        const token = await TokenModel.create({
            data: {
                userId: user_id,
                jwt: tokenc,
                expireIn : decode.exp
            },
            select: {
                jwt: true
            }
        })
        if (!token) throw new Error('Token generation')
        return token.jwt
    }
}