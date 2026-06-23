import path from 'node:path'
import { Router } from 'express'
import mongoose from 'mongoose'

const BUCKET_NAME = 'productImages'

const EXT_TO_MIME = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
}

const MIME_TO_EXT = Object.fromEntries(
    Object.entries(EXT_TO_MIME).map(([ext, mime]) => [mime, ext])
)

function resolveContentType(file) {
    const stored = file.contentType || file.metadata?.contentType
    if (stored && stored !== 'application/octet-stream') return stored

    const fromName = EXT_TO_MIME[path.extname(file.filename || '').toLowerCase()]
    if (fromName) return fromName

    return 'image/jpeg'
}

function filenameForContentType(contentType, fileId) {
    const ext = MIME_TO_EXT[contentType] || '.jpg'
    return `image-${fileId}${ext}`
}

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

        const file = files[0]
        const contentType = resolveContentType(file)
        const downloadName = filenameForContentType(contentType, req.params.id)

        res.set('Content-Type', contentType)
        res.set('Content-Disposition', `inline; filename="${downloadName}"`)
        res.set('Cache-Control', 'public, max-age=31536000, immutable')
        bucket.openDownloadStream(id).pipe(res)
    } catch (err) {
        next(err)
    }
})

export default mediaRouter
