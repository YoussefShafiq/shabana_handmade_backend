import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import { PORT } from "../configs/app.config.js";
import testDbConncection from "./DB/connection.js";
import { testRedisConnection } from "./DB/redis.connection.js";
import authRouter from "./Modules/Auth/auth.controller.js";
import contactRouter from "./Modules/contact/contact.controller.js";
import homeRouter from "./Modules/Home/home.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import { globalErrorHandling } from "./utils/response/failResponse.js";
import { productRouter } from "./Modules/product/product.controller.js";
import { categoryRouter } from "./Modules/category/category.controller.js";
import mediaRouter from "./Modules/media/media.controller.js";



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
    app.use('/media', mediaRouter)
    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    app.use('/contact', contactRouter)
    app.use('/home', homeRouter)
    app.use('/product', productRouter)
    app.use('/category', categoryRouter)
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