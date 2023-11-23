import BaseJoi from "joi"
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate)

export const schema = {
    email : Joi.string().email().required(),
    password : Joi.string()
        .required()
        .min(8)
        .pattern(new RegExp(/^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/))
        .message('Entez un mot de passe contenant des chiffre et lettre'),
    firstName : Joi.string().min(2).required(),
    lastName : Joi.string().min(2).optional(),
    phone : Joi.string().required().min(9),
    id : Joi.number().required(),
    uuid: Joi.string().uuid().required(),
    age : Joi.number().min(1).max(100),
    title : Joi.string().required(),
    description : Joi.string().required(),
    image : Joi.string().required(),
    stringText: Joi.string().required(),
    gps_number: Joi.string().optional(),
    adminRegions: Joi.array().items(Joi.number()).required(),
    date: Joi.date().format('YYYY-MM-DD').required(),
    mileage: Joi.number().required(),
    daily_recipe: Joi.number().required(),
    regions: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required(),
                zone: Joi.string().required(),
            })
        )
        .required(),
    name: Joi.string().required(),
    owner: Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().optional(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
    }).required(),

}
    
