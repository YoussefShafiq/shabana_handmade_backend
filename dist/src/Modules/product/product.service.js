import CategoryModel from "../../DB/Models/category.model.js"
import ProductModel from "../../DB/Models/product.model.js"
import { deleteOne } from "../../DB/Repository/delete.repo.js"
import { find, findById, findOne } from "../../DB/Repository/get.repo.js"
import { insertOne } from "../../DB/Repository/insert.repo.js"
import { findByIdAndUpdate } from "../../DB/Repository/update.repo.js"
import { conflictException, notFoundException } from "../../utils/response/failResponse.js"

export async function createProduct(productData) {
    const { slug, name, price, category, shortDescription, description, materials, size, leadTime, images, instagramUrl, isActive, isNew } = productData
    const existingProduct = await findOne(ProductModel, { slug })

    const existingCategory = await findById(CategoryModel, category)
    if (!existingCategory) {
        notFoundException('category not found, please enter a valid category')
    }
    if (existingProduct) {
        conflictException('product already exists, please use a different slug')
    }
    const newProduct = await insertOne(ProductModel, { slug, name, price, category, shortDescription, description, materials, size, leadTime, images, instagramUrl, isActive, isNew })
    return newProduct
}

export async function getAllProducts() {
    const products = await ProductModel.find().populate('category');
    return products;
}

export async function toggleActivation(id) {
    const product = await findOne(ProductModel, { _id: id })
    if (!product) {
        notFoundException('product not found')
    }
    product.isActive = !product.isActive
    await product.save()
    return product
}

export async function updateProduct(id, body) {
    const { slug, name, price, category, shortDescription, description, materials, size, leadTime, images, instagramUrl, isActive, isNew } = body
    const product = await findOne(ProductModel, { _id: id })

    if (!product) {
        notFoundException('product not found')
    }

    if (category) {
        const existingCategory = await findById(CategoryModel, category)
        if (!existingCategory) {
            notFoundException('category not found, please enter a valid category')
        }
    }

    const updatedProduct = await findByIdAndUpdate(ProductModel, id, { slug, name, price, category, shortDescription, description, materials, size, leadTime, images, instagramUrl, isActive, isNew })
    return updatedProduct
}

export async function deleteProduct(id) {
    const product = await findOne(ProductModel, { _id: id })
    if (!product) {
        notFoundException('product not found')
    }
    await deleteOne(ProductModel, { _id: id })
    return product
}