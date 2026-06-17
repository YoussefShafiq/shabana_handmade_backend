import { Router } from "express";
import { getHome } from "./home.service.js";
import successResponse from "../../utils/response/successResponse.js";

const homeRouter = Router()

homeRouter.get('/', async (req, res) => {
    const result = await getHome()
    return successResponse({ res, data: result, message: 'Home retrieved successfully', statusCode: 200 })
})

export default homeRouter