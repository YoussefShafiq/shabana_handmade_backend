import { Router } from 'express'
import mongoose from 'mongoose'

const BUCKET_NAME = 'productImages'

const mediaRouter = Router()

mediaRouter.get('/files/:id', async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ success: false, message: 'database not ready' })
        }

        const id = new mongoose.Types.ObjectId(req.params.id)
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME })
        const files = await bucket.find({ _id: id }).toArray()

        if (!files.length) {
            return res.status(404).json({ success: false, message: 'file not found' })
        }

        res.set('Content-Type', files[0].contentType || 'application/octet-stream')
        res.set('Cache-Control', 'public, max-age=31536000, immutable')
        bucket.openDownloadStream(id).pipe(res)
    } catch (err) {
        next(err)
    }
})

export default mediaRouter
