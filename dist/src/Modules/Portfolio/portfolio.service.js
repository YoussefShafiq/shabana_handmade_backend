import portfolioModel from "../../DB/Models/portfolio.model.js"
import { deleteOne } from "../../DB/Repository/delete.repo.js"
import { find, findOne } from "../../DB/Repository/get.repo.js"
import { insertMany, insertOne } from "../../DB/Repository/insert.repo.js"
import { findByIdAndUpdate } from "../../DB/Repository/update.repo.js"
import { notFoundException } from "../../utils/response/failResponse.js"
import { slugify } from "../../utils/slug/slug.util.js"

export async function createPortfolio(body) {
    const { slug, title, description, image, tags, topics, processSteps, images, solution, processImages } = body
    const portfolio = await insertOne(portfolioModel, { slug, title, description, image, tags, topics, processSteps, images, solution, processImages })
    return portfolio
}

export async function createPortfolioBulk(body) {
    const portfolios = await insertMany(portfolioModel, body)
    return portfolios
}

export async function getPortfolio(slug) {
    const portfolio = await findOne(portfolioModel, { slug })
    if (!portfolio) {
        notFoundException('Portfolio not found')
    }
    return portfolio
}

export async function getAllPortfolios() {
    const portfolios = await find(portfolioModel, {}, '-processSteps -problem -images -solution -processImages')
    return portfolios
}

export async function updatePortfolio(id, body) {
    const { slug, title, description, image, tags, topics, processSteps, images, solution, processImages } = body
    const portfolio = await findByIdAndUpdate(portfolioModel, id, { slug, title, description, image, tags, topics, processSteps, images, solution, processImages })
    if (!portfolio) {
        notFoundException('Portfolio not found')
    }
    return portfolio
}

export async function deletePortfolio(_id) {
    const portfolio = await deleteOne(portfolioModel, { _id })
    if (portfolio.deletedCount === 0) {
        notFoundException('Portfolio not found')
    }
    return
}