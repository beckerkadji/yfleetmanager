import { ROLE_HR } from "../models/role"
import { defaultEmail } from "./defaults/email.types"
import { defaultFisrtName } from "./defaults/firstName.type"
import { defaultLastName } from "./defaults/lastName.type"
import { defaultOtp } from "./defaults/otp.type"
import { defaultPhone } from "./defaults/phone.type"
import {defaultRegion} from "./defaults/region.type";

declare namespace VehicleType {
    export interface vehicleCreateFields {
        brand_id : number,
        model_id: number,
        chassis_number : string,
        color_id: number
        gps_number?: string
        registration_number: string
        insurance_subscription_at: Date
        circulation_at : Date,
        entry_fleet_at: Date,
        mileage: number
        daily_recipe: number
        phone: defaultPhone,
        role : ROLE_HR,
        password: string,
    }
    export interface brandCreate {
        name: string
    }

    export interface modelCreateField {
        brand_id: number
        name: string
    }

    export interface modelCreate {

    }
}
export default VehicleType

