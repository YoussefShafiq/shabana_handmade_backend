import portfolioModel from "../../DB/Models/portfolio.model.js"
import serviceModel from "../../DB/Models/service.model.js"
import { find } from "../../DB/Repository/get.repo.js"

export async function getHome() {
    const portfolios = await find(portfolioModel, {}, '-processSteps -problem -images -solution -processImages', 3)
    const services = await find(serviceModel, {}, '-topics -tags -description', 3)
    return { portfolios, services }
}