import Joi from "joi";
import { commonValidation } from "../../Middlewares/validation.middleware.js";

export const createContactSchema = {
    body: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: commonValidation.email.optional().allow('', null),
        phone: Joi.string().min(8).max(20).required().messages({
            'any.required': 'phone is required',
            'string.min': 'phone must be at least 8 characters',
        }),
        productName: Joi.string().max(200).optional().allow('', null),
        message: Joi.string().min(5).max(2000).required(),
    }).required(),
}

export const contactIdSchema = {
    params: Joi.object({
        id: commonValidation.id.required(),
    }).required(),
}
