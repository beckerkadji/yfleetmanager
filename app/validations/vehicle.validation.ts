import Joi from "joi";
import  {schema}  from "../utils/schema";

export const brandSchema = Joi.object({
    name : schema.name,
})

export const modelSchema = Joi.object({
    name : schema.name,
    brand_id: schema.id
})