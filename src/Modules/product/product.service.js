import CategoryModel from "../../DB/Models/category.model.js"
import ProductModel from "../../DB/Models/product.model.js"
import { deleteOne } from "../../DB/Repository/delete.repo.js"
import { find, findById, findOne } from "../../DB/Repository/get.repo.js"
import { insertOne } from "../../DB/Repository/insert.repo.js"
import { findByIdAndUpdate } from "../../DB/Repository/update.repo.js"
import { badRequestException, conflictException, notFoundException } from "../../utils/response/failResponse.js"
import { deleteStoredImage } from "../../utils/storage/imageStorage.js"

function imageFileKey(imagePath) {
    if (!imagePath) return ''
    return imagePath.replace(/\\/g, '/').split('/').pop()
}

function findImageIndex(images, imagePath) {
    const targetKey = imageFileKey(imagePath)
    return images.findIndex((img) => img === imagePath || imageFileKey(img) === targetKey)
}

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
    const newProduct = await insertOne(ProductModel, {
        slug, name, price, category, shortDescription, description, materials, size, leadTime,
        images: images ?? [],
        instagramUrl, isActive, isNew,
    })
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

export async function updateProduct(id, body, newImages = []) {
    const product = await findOne(ProductModel, { _id: id })

    if (!product) {
        notFoundException('product not found')
    }

    const { slug, name, price, category, shortDescription, description, materials, size, leadTime, instagramUrl, isActive, isNew } = body

    if (category) {
        const existingCategory = await findById(CategoryModel, category)
        if (!existingCategory) {
            notFoundException('category not found, please enter a valid category')
        }
    }

    const update = {}
    if (slug !== undefined) update.slug = slug
    if (name !== undefined) update.name = name
    if (price !== undefined) update.price = price
    if (category !== undefined) update.category = category
    if (shortDescription !== undefined) update.shortDescription = shortDescription
    if (description !== undefined) update.description = description
    if (materials !== undefined) update.materials = materials
    if (size !== undefined) update.size = size
    if (leadTime !== undefined) update.leadTime = leadTime
    if (instagramUrl !== undefined) update.instagramUrl = instagramUrl
    if (isActive !== undefined) update.isActive = isActive
    if (isNew !== undefined) update.isNew = isNew

    if (newImages.length) {
        update.images = [...(product.images || []), ...newImages]
    }

    const updatedProduct = await findByIdAndUpdate(ProductModel, id, update, { new: true })
    return updatedProduct
}

export async function deleteProductImage(id, imagePath) {
    const product = await findOne(ProductModel, { _id: id })

    if (!product) {
        notFoundException('product not found')
    }

    const images = product.images || []
    const imageIndex = findImageIndex(images, imagePath)

    if (imageIndex === -1) {
        notFoundException('image not found on this product')
    }

    const remainingImages = images.length - 1
    if (remainingImages < 1) {
        badRequestException('product must have at least one image')
    }

    const imageToDelete = images[imageIndex]
    await deleteStoredImage(imageToDelete)

    const updatedImages = images.filter((_, index) => index !== imageIndex)
    const updatedProduct = await findByIdAndUpdate(
        ProductModel,
        id,
        { images: updatedImages },
        { new: true }
    )
    return updatedProduct
}

export async function deleteProduct(id) {
    const product = await findOne(ProductModel, { _id: id })
    if (!product) {
        notFoundException('product not found')
    }

    for (const image of product.images || []) {
        await deleteStoredImage(image)
    }

    await deleteOne(ProductModel, { _id: id })
    return product
}

export async function getPublicProducts() {
    const products = await ProductModel.find({ isActive: true }).populate('category');
    return products;
}

export async function getPublicProductBySlug(slug) {
    const product = await ProductModel.findOne({ slug, isActive: true }).populate('category')
    if (!product) {
        notFoundException('product not found')
    }
    return product
}