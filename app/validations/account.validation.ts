import Joi from "joi";
import {schema} from "../utils/schema";

export const accountCreateSchema = Joi.object({
    owner : schema.owner,
    regions: schema.regions
})