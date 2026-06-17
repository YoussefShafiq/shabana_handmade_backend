import { Router } from "express";
import { createPortfolio, createPortfolioBulk, deletePortfolio, getAllPortfolios, getPortfolio, updatePortfolio } from "./portfolio.service.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import successResponse from "../../utils/response/successResponse.js";
import { notFoundException } from "../../utils/response/failResponse.js";

const portfolioRouter = Router()

portfolioRouter.post('/create', authentication(), async (req, res) => {
    const result = await createPortfolio(req.body)
    return successResponse({ res, data: result, message: 'Portfolio created successfully', statusCode: 201 })
})

portfolioRouter.post('/create-bulk', authentication(), async (req, res) => {
    const result = await createPortfolioBulk(req.body)
    return successResponse({ res, data: result, message: 'Portfolios created successfully', statusCode: 201 })
})

portfolioRouter.get('/get/:slug', async (req, res) => {
    const result = await getPortfolio(req.params.slug)
    return successResponse({ res, data: result, message: 'Portfolio retrieved successfully', statusCode: 200 })
})

portfolioRouter.get('/get-all', async (req, res) => {
    const result = await getAllPortfolios()
    return successResponse({ res, data: result, message: 'All portfolios retrieved successfully', statusCode: 200 })
})

portfolioRouter.put('/update/:id', authentication(), async (req, res) => {
    await updatePortfolio(req.params.id, req.body)
    return successResponse({ res, message: 'Portfolio updated successfully', statusCode: 200 })
})

portfolioRouter.delete('/delete/:id', authentication(), async (req, res) => {
    await deletePortfolio(req.params.id)

    return successResponse({ res, message: 'Portfolio deleted successfully', statusCode: 200 })
})

export default portfolioRouter