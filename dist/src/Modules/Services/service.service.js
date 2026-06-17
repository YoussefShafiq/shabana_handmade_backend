import serviceModel from "../../DB/Models/service.model.js"
import { find, findById, findOne } from "../../DB/Repository/get.repo.js"
import { insertMany, insertOne } from "../../DB/Repository/insert.repo.js"
import { findByIdAndUpdate } from "../../DB/Repository/update.repo.js"
import { deleteOne } from "../../DB/Repository/delete.repo.js"
import { conflictException, notFoundException, badRequestException } from "../../utils/response/failResponse.js"


export async function createService(body) {
    const { slug, title, icon, shortDescription, description, tags, topics } = body
    const exsistingService = await findOne(serviceModel, { slug })
    if (exsistingService) {
        conflictException('service already exists, please use a different slug')
    }
    const newService = await insertOne(serviceModel, { slug, title, icon, shortDescription, description, tags, topics })
    return newService
}

export async function createBulkServices(body) {
    const services = Array.isArray(body) ? body : body?.services
    if (!Array.isArray(services) || services.length === 0) {
        badRequestException('Request body must be a non-empty array of services, or { "services": [...] }')
    }
    const createdServices = await insertMany(serviceModel, services)
    return createdServices
}

export async function getAllServices() {
    const services = await find(serviceModel, {}, '-topics -tags -description')
    return services
}

export async function getServiceBySlug(slug) {
    const service = await findOne(serviceModel, { slug })
    if (!service) {
        notFoundException('service not found')
    }
    return service
}

export async function updateService(_id, body) {
    const { slug, title, icon, shortDescription, description, tags, topics } = body
    const updatedService = await findByIdAndUpdate(serviceModel, _id, { slug, title, icon, shortDescription, description, tags, topics })
    if (!updatedService) {
        notFoundException('service not found')
    }

    return updatedService
}

export async function deleteService(_id) {
    const deletedService = await deleteOne(serviceModel, { _id })
    if (deletedService.deletedCount === 0) {
        notFoundException('service not found')
    }
    return deletedService
}