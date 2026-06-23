import path from 'node:path'
import { Router } from 'express'
import mongoose from 'mongoose'
import { ensureDbConnection } from '../../DB/connection.js'
import {
    EXT_TO_MIME,
    MIME_TO_EXT,
    sniffImageMime,
} from '../../utils/storage/imageStorage.js'

const BUCKET_NAME = 'productImages'

function parseFileId(param) {
    return param.replace(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i, '')
}

function resolveContentType(file, urlExt) {
    const stored = file.contentType || file.metadata?.contentType
    if (stored && stored !== 'application/octet-stream') return stored

    const fromUrl = urlExt ? EXT_TO_MIME[`.${urlExt.toLowerCase()}`] : null
    if (fromUrl) return fromUrl

    const fromName = EXT_TO_MIME[path.extname(file.filename || '').toLowerCase()]
    if (fromName) return fromName

    return null
}

function filenameForContentType(contentType, fileId) {
    const ext = MIME_TO_EXT[contentType] || '.jpg'
    return `image-${fileId}${ext}`
}

async function readStreamToBuffer(stream) {
    const chunks = []
    for await (const chunk of stream) {
        chunks.push(chunk)
    }
    return Buffer.concat(chunks)
}

const mediaRouter = Router()

mediaRouter.get('/files/:id', async (req, res, next) => {
    try {
        await ensureDbConnection()

        const idHex = parseFileId(req.params.id)
        const urlExt = req.params.id.includes('.')
            ? req.params.id.split('.').pop()
            : null

        const id = new mongoose.Types.ObjectId(idHex)
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME })
        const files = await bucket.find({ _id: id }).toArray()

        if (!files.length) {
            return res.status(404).json({ success: false, message: 'file not found' })
        }

        const file = files[0]
        const buffer = await readStreamToBuffer(bucket.openDownloadStream(id))

        let contentType = resolveContentType(file, urlExt) || sniffImageMime(buffer)
        const downloadName = filenameForContentType(contentType, idHex)

        res.set('Content-Type', contentType)
        res.set('Content-Disposition', `inline; filename="${downloadName}"`)
        res.set('Cache-Control', 'public, max-age=31536000, immutable')
        res.send(buffer)
    } catch (err) {
        next(err)
    }
})

export default mediaRouter
