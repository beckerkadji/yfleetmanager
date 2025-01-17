import { ROLE_HR } from "../models/role"
import { defaultEmail } from "./defaults/email.types"
import { defaultFisrtName } from "./defaults/firstName.type"
import { defaultLastName } from "./defaults/lastName.type"
import { defaultOtp } from "./defaults/otp.type"
import { defaultPhone } from "./defaults/phone.type"
import {defaultRegion} from "./defaults/region.type";

declare namespace UserType {
    export interface userCreateFields {
        firstName : defaultFisrtName,
        lastName ?: defaultLastName,
        email : defaultEmail,
        phone: defaultPhone,
        role : ROLE_HR,
        password: string,
    }

    export interface verifiedFields {
        new_password: string,
        email: defaultEmail,
        token: string
    }

    export interface adminCreateFields {
        first_name : defaultFisrtName,
        last_name ?: defaultLastName,
        assign_regions: number[],
        email : defaultEmail,
        phone: defaultPhone,
    }
    interface Region {
        name: defaultRegion,
        zone: string
    }

    export interface loginFields {
        email: defaultEmail,
        password : string
    }

    export interface forgotPasswordFields {
        email: defaultEmail,
    }

    export interface resetPasswordFields {
        email: defaultEmail,
        password: string
    }

    export interface verifyOtp {
        email: defaultEmail,
        otp: defaultOtp
    }

    export interface resendOtp {
        email: defaultEmail,
    }
}
export default UserType

