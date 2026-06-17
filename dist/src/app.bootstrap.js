import express from "express";
import { NODE_ENV, PORT } from "../configs/app.config.js";
import testDbConncection from "./DB/connection.js";
import authRouter from "./Modules/Auth/auth.controller.js";
import { badRequestException, globalErrorHandling } from "./utils/response/failResponse.js";
import userRouter from "./Modules/User/user.controller.js";
import cors from "cors";
import path from "path"
import { testRedisConnection } from "./DB/redis.connection.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { del, get, incr, set } from "./DB/Repository/redis.repo.js";
import serviceRouter from "./Modules/Services/service.controller.js";
import contactRouter from "./Modules/contact/contact.controller.js";
import portfolioRouter from "./Modules/Portfolio/portfolio.controller.js";
import homeRouter from "./Modules/Home/home.controller.js";



export default async function bootstrap() {
    const app = express();
    await testDbConncection()
    await testRedisConnection()


    app.use(
        express.json(),
        cors(),
        helmet()
    )
    app.use('/uploads', express.static(path.resolve('./uploads')))
    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/service', serviceRouter)
    app.use('/contact', contactRouter)
    app.use('/portfolio', portfolioRouter)
    app.use('/home', homeRouter)
    app.use(globalErrorHandling)

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })

    app.all('*d', (req, res) => {
        return res.status(400).json({
            success: false,
            message: 'invalid route or method'
        })
    })
}