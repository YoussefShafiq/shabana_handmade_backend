import { Router } from "express";
import uploadLocal, { getUploadPublicPath } from "../../utils/Multer/multer.config.js";
import { createProduct, deleteProduct, deleteProductImage, getAllProducts, getPublicProductBySlug, getPublicProducts, toggleActivation, updateProduct } from "./product.service.js";
import { createProductSchema, deleteProductImageSchema, deleteProductSchema, updateProductSchema } from "../../utils/validationSchemas/product.schema.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import successResponse from "../../utils/response/successResponse.js";


export const productRouter = Router()
 
function mapUploadedImages(files) {
    return (files ?? []).map((file) => getUploadPublicPath(file, 'images'))
}

productRouter.post('', authentication(), uploadLocal('images').array('images', 10), validation(createProductSchema), async (req, res) => {
    const product = await createProduct({ ...req.body, images: mapUploadedImages(req.files) })
    return successResponse({ res, data: product, message: 'Product created successfully', statusCode: 201 })
})

productRouter.get('', authentication(), async (req, res) => {
    const products = await getAllProducts()
    return successResponse({ res, data: products, message: 'Products fetched successfully', statusCode: 200 })
})

productRouter.get('/public', async (req, res) => {
    const products = await getPublicProducts()
    return successResponse({ res, data: products, message: 'Products fetched successfully', statusCode: 200 })
})

productRouter.get('/public/:slug', async (req, res) => {
    const product = await getPublicProductBySlug(req.params.slug)
    return successResponse({ res, data: product, message: 'Product fetched successfully', statusCode: 200 })
})

productRouter.patch('/toggle-activation/:id', authentication(), async (req, res) => {
    const product = await toggleActivation(req.params.id)
    return successResponse({ res, data: product, message: 'Product activation toggled successfully', statusCode: 200 })
})

productRouter.patch('/:id', authentication(), uploadLocal('images').array('images', 10), validation(updateProductSchema), async (req, res) => {
    const product = await updateProduct(req.params.id, req.body, mapUploadedImages(req.files))
    return successResponse({ res, data: product, message: 'Product updated successfully', statusCode: 200 })
})

productRouter.delete('/:id/images', authentication(), validation(deleteProductImageSchema), async (req, res) => {
    const product = await deleteProductImage(req.params.id, req.body.image)
    return successResponse({ res, data: product, message: 'Product image deleted successfully', statusCode: 200 })
})

productRouter.delete('/:id', authentication(), validation(deleteProductSchema), async (req, res) => {
    const product = await deleteProduct(req.params.id)
    return successResponse({ res, data: product, message: 'Product deleted successfully', statusCode: 200 })
})