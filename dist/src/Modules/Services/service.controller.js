import { Router } from "express";

const serviceRouter = Router()

import {
    createService,
    getAllServices,
    getServiceBySlug,
    updateService,
    deleteService,
    createBulkServices
} from "./service.service.js"
import successResponse from "../../utils/response/successResponse.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";

// Create a new service
serviceRouter.post("/", authentication(), async (req, res) => {
    const service = await createService(req.body);
    return successResponse({ res, data: service, message: 'Service created successfully', statusCode: 201 })

});


// Create bulk services
serviceRouter.post("/bulk", authentication(), async (req, res) => {
    console.log(req.body);
    const services = await createBulkServices(req.body);
    return successResponse({ res, data: services, message: 'Services created successfully', statusCode: 201 })
});

// Get all services
serviceRouter.get("/", async (req, res) => {
    const services = await getAllServices();
    return successResponse({ res, data: services, message: 'Services retrieved successfully' })

});

// Get service by slug
serviceRouter.get("/:slug", async (req, res) => {
    const service = await getServiceBySlug(req.params.slug);
    return successResponse({ res, data: service, message: 'Service retrieved successfully' })

});

// Update a service
serviceRouter.put("/:_id", authentication(), async (req, res) => {
    await updateService(req.params._id, req.body);
    return successResponse({ res, message: 'Service updated successfully' })

});

// Delete a service
serviceRouter.delete("/:_id", authentication(), async (req, res) => {

    const deleted = await deleteService(req.params._id);
    return successResponse({ res, message: 'Service deleted successfully' })

});


export default serviceRouter