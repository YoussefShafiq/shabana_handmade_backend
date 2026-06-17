import contactModel from "../../DB/Models/contact.model.js"
import { find, findById } from "../../DB/Repository/get.repo.js"
import { insertOne } from "../../DB/Repository/insert.repo.js"
import { sendContactEmail } from "../../utils/email/sendEmail.util.js"

export async function createContact(body) {
    const { name, company, email, phone, serviceType, message } = body
    const contact = await insertOne(contactModel, { name, company, email, phone, serviceType, message })
    sendContactEmail(name, company, email, phone, serviceType, message)
    return contact
}

export async function getContacts() {
    const contacts = await find(contactModel)
    return contacts
}

export async function getContactById(id) {
    const contact = await findById(contactModel, id)
    return contact
}