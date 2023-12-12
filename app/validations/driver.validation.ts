import Joi from "joi";
import  {schema}  from "../utils/schema";


export const driverCreateSchema = Joi.object({
        first_name: schema.stringText,
        last_name: schema.stringText,
        email: schema.email,
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
        region_id: schema.stringText,
        vehicle_principal_id: schema.stringTextOptional,
        vehicle_interimaire_id: schema.stringTextOptional
})
