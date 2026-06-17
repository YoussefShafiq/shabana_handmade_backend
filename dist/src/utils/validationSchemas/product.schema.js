import Joi from "joi";
import { commonValidation } from "../../Middlewares/validation.middleware.js";

export const createProductSchema = {
    body: Joi.object({
        slug: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().required(),
        category: commonValidation.id.required(),
        shortDescription: Joi.string().required(),
        description: Joi.string().required(),
        materials: Joi.string().required(),
        size: Joi.string().optional(),
        leadTime: Joi.string().optional(),
        instagramUrl: Joi.string().optional(),
        isActive: Joi.boolean().default(true),
        isNew: Joi.boolean().default(false),
    }).required()
}

export const updateProductSchema = {
    params: Joi.object({
        id: commonValidation.id.required(),
    }).required(),
    body: Joi.object({
        slug: Joi.string().optional(),
        name: Joi.string().optional(),
        price: Joi.number().optional(),
        category: commonValidation.id.required(),
        shortDescription: Joi.string().optional(),
        description: Joi.string().optional(),
        materials: Joi.string().optional(),
        size: Joi.string().optional(),
        leadTime: Joi.string().optional(),
        instagramUrl: Joi.string().optional(),
        isActive: Joi.boolean().default(true),
        isNew: Joi.boolean().default(false),
    }).required()
}

export const deleteProductSchema = {
    params: Joi.object({
        id: commonValidation.id.required(),
    }).required(),
}