import CategoryModel from "../../DB/Models/category.model.js"
import { deleteOne } from "../../DB/Repository/delete.repo.js"
import { find, findById, findOne } from "../../DB/Repository/get.repo.js"
import { insertOne } from "../../DB/Repository/insert.repo.js"
import { findByIdAndUpdate } from "../../DB/Repository/update.repo.js"
import { conflictException, notFoundException } from "../../utils/response/failResponse.js"

export async function getAllCategories() {
    const categories = await find(CategoryModel)
    return categories
}

export async function getPublicCategories() {
    const categories = await CategoryModel.find({ isActive: true })
    return categories
}

export async function createCategory(data) {
    const { slug, name, isActive, isNew } = data
    const existingCategory = await findOne(CategoryModel, { slug })
    if (existingCategory) {
        conflictException('category already exists, please use a different slug')
    }
    const newCategory = await insertOne(CategoryModel, { slug, name, isActive, isNew })
    return newCategory
}

export async function updateCategory(id, data) {
    const { slug, name, isActive, isNew } = data
    const existingCategory = await findOne(CategoryModel, { _id: id })
    if (!existingCategory) {
        notFoundException('category not found')
    }
    const updatedCategory = await findByIdAndUpdate(CategoryModel, id, { slug, name, isActive, isNew })
    return updatedCategory
}

export async function deleteCategory(id) {
    const category = await findById(CategoryModel, id)
    if (!category) {
        notFoundException('category not found')
    }
    await deleteOne(CategoryModel, { _id: id })
    return category
}


export async function toggleActivation(id) {
    const category = await findOne(CategoryModel, { _id: id })
    if (!category) {
        notFoundException('category not found')
    }
    category.isActive = !category.isActive
    await category.save()
    return category
}