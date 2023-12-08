import dotenv from "dotenv";
import {Controller} from "tsoa";
import cloudinary from "cloudinary";
import Mailer from "../../src/core/notifications/mail";
import {USER_ROLE} from "../models/role";
import {TokenModel} from "../models/token";
import AWS from "aws-sdk"
import * as stream from "stream";
import sharp from "sharp"

AWS.config.update({
    accessKeyId: process.env.AWSACCESSKEYID,
    secretAccessKey: process.env.AWSSECRETKEY,
    region: process.env.REGION
})

const s3 = new AWS.S3();

export enum AUTHORIZATION  {
    TOKEN = "Jwt"   
};

dotenv.config();

cloudinary.v2.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUNDINARY_API_SECRET
})


export interface IResponse {
    code : number,

    message ?: string,

    data?: any
}

export class My_Controller extends Controller {


    public validate (schema: any, fields:any) : boolean | object {
        
        const validation  = schema.validate(fields,  { abortEarly: false });
        let errors : any = {};
        if (validation.error){
            for (const field of validation.error.details){
                errors[field.context.key] = field.message
            }
            return errors;
        }else {
            return true
        }
        
    }

    public generatePassword = (): string => {
        let result = '';
        let characters = <string>process.env.RANDOM_PASSWORD || "1234567890qwertyuyiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM"
        let slugLength = characters.length
        for ( let i = 0; i < 15; i++ ) {
            result += characters.charAt(Math.floor(Math.random() *
                slugLength));
        }
        return result;
    }

    public sanityzeRole = (role: string): number =>{
		switch( role ){
			case "root":
				return USER_ROLE.ROOT;
            case "owner":
                return USER_ROLE.OWNER;
			case "admin":
				return USER_ROLE.ADMIN;
            case "agent":
                return USER_ROLE.AGENT;
			case "user" :
				return USER_ROLE.DRIVER;
			default :
				throw new Error("Unknown role")
		}
	}

    public generate_otp() : number{
        const otpTable = ['0','1','2','3','4','5','6','7','8','9']
        const random = [];
        for(let i = 0; i<4; i++){
         random.push(Math.floor(Math.random() * otpTable.length))
        }
        const otp = random.join('').substring(0, 4)
        return parseInt(otp)
    }

    public async sendSMS (config : {
        to : string | string[],
        subject : string,
        modelName : string,
        data ?: object
    }) : Promise<void> {
        return await Mailer.sendFromTemplate(config.to, config.subject, "", config.modelName, config.data);
    }

    public async sendMailFromTemplate (config : {
        to : string | string[],
        subject : string,
        modelName : string,
        data ?: object
    }) : Promise<any> {
        return await Mailer.sendFromTemplate(config.to, config.subject, "", config.modelName, config.data);
    }

    public async getUserId(token: string | undefined): Promise<any> {
        return TokenModel.findFirst({
            where: {
                jwt: token
            },
            select: {
                userId: true
            }
        });
    }

    /**
     * 
     * @param file 
     * @returns Array of url for multiple upload file or url for single file upload
     */
    public async uploadFile (file : Express.Multer.File[] | Express.Multer.File ) : Promise<any> {

        if (Array.isArray(file)){
            const urls : any = [];
            for (const item of file){
                let metadataImages: any
                sharp(item.buffer).metadata().then(metadata => {
                    const {width, height } = metadata
                    metadataImages = metadata
                }).catch(err => {
                    console.error('Erreur lors de la récupération des metas données de l\'image:', err);
                })
                const newPath = await this.ImageUploadMethod(item)
                urls.push({...newPath, metadata: metadataImages})
            }

            return urls
        }else {
            let metadataImages: any
            sharp(file.buffer).metadata().then(metadata => {
                const {width, height } = metadata
                metadataImages = metadata
            }).catch(err => {
                console.error('Erreur lors de la récupération des metas données de l\'image:', err);
            })
            const res = await this.ImageUploadMethod(file)
            return {res, metadata: metadataImages};
        }
    }

    private async ImageUploadMethod(file : Express.Multer.File) : Promise<any> {

        const readStream = new stream.PassThrough();
        readStream.end(file.buffer);

        const params = {
            Bucket: 'images.vtccontrol.com/public',
            Key: Date.now().toString() + '-' + file.originalname,
            Body: readStream,
        };
        return new Promise((resolve, rejects) => {
            s3.upload(params,
                (error: any, result: any) => {
                    if(error){
                        console.log();
                        console.log("** File Upload (Promise)");
                        console.warn(error);
                        rejects(error)
                    } else {
                        console.log("** File Upload (Promise)");
                        console.log("*Finish ! public_id for the uploaded image is generated AWS service.");
                        // let url = result?.secure_url
                        resolve(result)
                    }
            });
        })
    }
}

