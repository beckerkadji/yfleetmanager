import Joi from "joi";
import  {schema}  from "../utils/schema";


export const driverCreateSchema = Joi.object({
        first_name: schema.stringText,
        last_name: schema.stringText,
        birthday: schema.gps_number,
        place_Birth: schema.stringText,
        phone: schema.stringText,
        cni_number: schema.stringText,
        city_id: schema.stringText,
        grade_id: schema.stringText,
        driver_type_id: schema.stringText,
        driver_licence_number: schema.stringText,
        driver_licence_type: schema.stringText,
        country_licence_delivery: schema.stringText,
        expire_delivery_at: schema.stringText,
        issue_delivery_on: schema.stringText,
        regionId: schema.stringText,
        Vehicle_principal_id: schema.stringText
})
