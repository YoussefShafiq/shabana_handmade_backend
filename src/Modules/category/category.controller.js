import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from "../../utils/validationSchemas/category.schema.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import { createCategory, deleteCategory, getAllCategories, toggleActivation, updateCategory } from "./category.service.js";
import successResponse from "../../utils/response/successResponse.js";

export const categoryRouter = Router()

categoryRouter.get('', authentication(), async (req, res) => {
    const categories = await getAllCategories()
    return successResponse({ res, data: categories, message: 'Categories fetched successfully', statusCode: 200 })
})

categoryRouter.post('', authentication(), validation(createCategorySchema), async (req, res) => {
    const category = await createCategory(req.body)
    return successResponse({ res, data: category, message: 'Category created successfully', statusCode: 201 })
})

categoryRouter.put('/:id', authentication(), validation(updateCategorySchema), async (req, res) => {
    const category = await updateCategory(req.params.id, req.body)
    return successResponse({ res, data: category, message: 'Category updated successfully', statusCode: 200 })
})

categoryRouter.delete('/:id', authentication(), validation(deleteCategorySchema), async (req, res) => {
    const category = await deleteCategory(req.params.id)
    return successResponse({ res, data: category, message: 'Category deleted successfully', statusCode: 200 })
})

categoryRouter.patch('/toggle-activation/:id', authentication(), async (req, res) => {
    const category = await toggleActivation(req.params.id)
    return successResponse({ res, data: category, message: 'Category activation toggled successfully', statusCode: 200 })
})