import Joi from "joi";
import { commonValidation } from "../../Middlewares/validation.middleware.js";

export const createCategorySchema = {
    body: Joi.object({
        slug: Joi.string().required(),
        name: Joi.string().required(),
        isActive: Joi.boolean().default(true),
        isNew: Joi.boolean().default(false),
    }).required()
}

export const updateCategorySchema = {
    params: Joi.object({
        id: commonValidation.id.required(),
    }).required(),
    body: Joi.object({
        slug: Joi.string().required(),
        name: Joi.string().required(),
        isActive: Joi.boolean().default(true),
        isNew: Joi.boolean().default(false),
    }).required()
}

export const deleteCategorySchema = {
    params: Joi.object({
        id: commonValidation.id.required(),
    }).required()
}