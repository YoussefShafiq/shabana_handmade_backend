import mongoose from 'mongoose'
import { DB_URL } from '../../configs/app.config.js'

let connectPromise = null

export async function ensureDbConnection() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection
    }

    if (mongoose.connection.readyState === 2) {
        await mongoose.connection.asPromise()
        return mongoose.connection
    }

    if (!connectPromise) {
        connectPromise = mongoose
            .connect(DB_URL)
            .then((conn) => {
                console.log('connected to DB successfully')
                return conn.connection
            })
            .catch((err) => {
                connectPromise = null
                console.log('error in connection to DB', err)
                throw err
            })
    }

    return connectPromise
}

const testDbConncection = () => ensureDbConnection()

export default testDbConncection
