import Joi from "joi";
import  {schema}  from "../utils/schema";

export const userCreateSchema = Joi.object({
    firstName : schema.firstName,
    lastName : schema.lastName,
    email : schema.email,
    password : schema.password,
    phone : schema.phone
})

export const adminCreateSchema = Joi.object({
    first_name : schema.firstName,
    last_name : schema.lastName,
    email : schema.email,
    phone : schema.phone,
    assign_regions: schema.adminRegions,
})

export const loginSchema = Joi.object({
    email : schema.email,
    password : schema.password
})

export const verifiedUserSchema = Joi.object({
    email : schema.email,
    new_password : schema.password,
    token: schema.stringText
})

export const forgotSchema = Joi.object({
    password : schema.password
})

export const resetPasswordSchema = Joi.object({
    email : schema.email,
    password : schema.password
})