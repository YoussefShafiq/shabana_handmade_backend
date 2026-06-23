import contactModel from "../../DB/Models/contact.model.js"
import { deleteOne } from "../../DB/Repository/delete.repo.js"
import { findById } from "../../DB/Repository/get.repo.js"
import { insertOne } from "../../DB/Repository/insert.repo.js"
import { notFoundException } from "../../utils/response/failResponse.js"
import { sendContactEmail } from "../../utils/email/sendEmail.util.js"

export async function createContact(body) {
    const { name, email, phone, productName, message } = body

    const contact = await insertOne(contactModel, {
        name,
        email: email || null,
        phone,
        productName: productName || null,
        message,
    })

    sendContactEmail({ name, email, phone, productName, message }).catch(() => {})

    return contact
}

export async function getContacts() {
    const contacts = await contactModel.find().sort({ createdAt: -1 })
    return contacts
}

export async function getContactById(id) {
    const contact = await findById(contactModel, id)
    if (!contact) {
        notFoundException('contact not found')
    }
    return contact
}

export async function deleteContact(id) {
    const contact = await getContactById(id)
    await deleteOne(contactModel, { _id: id })
    return contact
}
