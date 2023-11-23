import Joi from "joi";
import  {schema}  from "../utils/schema";

export const brandSchema = Joi.object({
    name : schema.name,
})

export const modelSchema = Joi.object({
    name : schema.name,
    brand_id: schema.id
})

export const vehicleOwnerSchema = Joi.object({
    first_name : schema.firstName,
    last_name: schema.lastName,
    cni_number: schema.stringText,
    driver_licence_number: schema.stringText
})

export const vehicleCreateSchema = Joi.object({
    brand_id: schema.stringText,
    model_id: schema.stringText,
    chassis_number: schema.stringText,
    color_id: schema.stringText,
    gps_number: schema.gps_number,
    registration_number: schema.stringText,
    insurance_subscription_at: schema.stringText,
    circulation_at: schema.stringText,
    entry_fleet_at: schema.stringText,
    mileage: schema.stringText,
    daily_recipe: schema.stringText,
    currency_id: schema.stringText,
    vehicle_owner_id: schema.stringText,
    region_id: schema.stringText,
    contract_type: schema.stringText
})