import {Get, Route, Tags, Security } from "tsoa";
import {AUTHORIZATION, IResponse, My_Controller} from "./controller";
import {UserModel} from "../models/user";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import { PERMISSION } from "../models/permission";
const response = new ResponseHandler()

@Tags("User Controller")
@Route("/user")

export class UserController extends My_Controller {
    @Security(AUTHORIZATION.TOKEN, [PERMISSION.ALL_PERMISSION])
    @Get("")
    public async index(
    ): Promise<IResponse> {
        try {
            let findUser = await UserModel.findMany({
                include : {
                    role: true,
                    childs: true,
                    hisAcount: true
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