import { Router } from "express";
import { createContact, getContactById, getContacts } from "./contact.service.js";
import successResponse from "../../utils/response/successResponse.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";

const contactRouter = Router()

contactRouter.post('/', async (req, res) => {
    await createContact(req.body)
    return successResponse({ res, message: 'Message sent successfully', statusCode: 201 })
})

contactRouter.get('/', authentication(), async (req, res) => {
    const contacts = await getContacts()
    return successResponse({ res, data: contacts, message: 'Contacts retrieved successfully', statusCode: 200 })
})

contactRouter.get('/:id', authentication(), async (req, res) => {
    const contact = await getContactById(req.params.id)
    return successResponse({ res, data: contact, message: 'Contact retrieved successfully', statusCode: 200 })
})

export default contactRouter