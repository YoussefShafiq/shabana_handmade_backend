import { Router } from "express";
import { createContact, deleteContact, getContactById, getContacts } from "./contact.service.js";
import successResponse from "../../utils/response/successResponse.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import { contactIdSchema, createContactSchema } from "../../utils/validationSchemas/contact.schema.js";

const contactRouter = Router()

contactRouter.post('/', validation(createContactSchema), async (req, res) => {
    const contact = await createContact(req.body)
    return successResponse({ res, data: contact, message: 'Message sent successfully', statusCode: 201 })
})

contactRouter.get('/', authentication(), async (req, res) => {
    const contacts = await getContacts()
    return successResponse({ res, data: contacts, message: 'Contacts retrieved successfully', statusCode: 200 })
})

contactRouter.get('/:id', authentication(), validation(contactIdSchema), async (req, res) => {
    const contact = await getContactById(req.params.id)
    return successResponse({ res, data: contact, message: 'Contact retrieved successfully', statusCode: 200 })
})

contactRouter.delete('/:id', authentication(), validation(contactIdSchema), async (req, res) => {
    const contact = await deleteContact(req.params.id)
    return successResponse({ res, data: contact, message: 'Contact deleted successfully', statusCode: 200 })
})

export default contactRouter
