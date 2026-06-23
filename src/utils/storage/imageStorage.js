import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { Readable } from 'node:stream'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import { put, del } from '@vercel/blob'
import { unhandledException } from '../response/failResponse.js'

const GRIDFS_BUCKET = 'productImages'

export function isCloudinaryConfigured() {
    return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    )
}

export function isVercelRuntime() {
    return process.env.VERCEL === '1'
}

export function isBlobStorage() {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function configureCloudinary() {
    if (!isCloudinaryConfigured()) return
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    })
}

configureCloudinary()

function sanitizeFileName(originalName) {
    const base = path.basename(originalName || 'image')
    return base.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function getPublicApiBase() {
    if (process.env.API_PUBLIC_URL) {
        return process.env.API_PUBLIC_URL.replace(/\/$/, '')
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }
    return ''
}

export function toAbsoluteMediaUrl(relativePath) {
    if (!relativePath || relativePath.startsWith('http')) return relativePath
    const base = getPublicApiBase()
    if (!base) return relativePath
    return `${base}${relativePath}`
}

function getGridFSBucket() {
    if (mongoose.connection.readyState !== 1) {
        unhandledException('database not connected')
    }
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: GRIDFS_BUCKET })
}

async function persistToCloudinary(file, folder) {
    configureCloudinary()

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `shabana/${folder}`,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) reject(error)
                else resolve(result.secure_url)
            }
        )
        Readable.from(file.buffer).pipe(uploadStream)
    })
}

async function persistToGridFS(file, folder) {
    const bucket = getGridFSBucket()
    const fileName = `${folder}/${randomUUID()}_${sanitizeFileName(file.originalname)}`

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(fileName, {
            contentType: file.mimetype || 'application/octet-stream',
            metadata: { folder },
        })

        uploadStream.on('error', reject)
        uploadStream.on('finish', () => {
            const relative = `/media/files/${uploadStream.id.toString()}`
            resolve(toAbsoluteMediaUrl(relative))
        })

        Readable.from(file.buffer).pipe(uploadStream)
    })
}

async function persistToBlob(file, folder) {
    const fileName = `${folder}/${randomUUID()}_${sanitizeFileName(file.originalname)}`
    const blob = await put(fileName, file.buffer, {
        access: 'public',
        contentType: file.mimetype || 'application/octet-stream',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return blob.url
}

async function persistToLocalDisk(file, folder) {
    const fileName = `${randomUUID()}_${sanitizeFileName(file.originalname)}`
    const dir = path.resolve(`./uploads/${folder}`)
    mkdirSync(dir, { recursive: true })
    const fullPath = path.join(dir, fileName)
    writeFileSync(fullPath, file.buffer)
    return `/uploads/${folder}/${fileName}`
}

export async function persistUploadedFile(file, folder = 'images') {
    if (!file?.buffer?.length) return null

    if (isCloudinaryConfigured()) {
        return persistToCloudinary(file, folder)
    }

    if (isBlobStorage()) {
        return persistToBlob(file, folder)
    }

    if (isVercelRuntime()) {
        return persistToGridFS(file, folder)
    }

    try {
        return await persistToLocalDisk(file, folder)
    } catch (err) {
        if (err?.code === 'EROFS') {
            return persistToGridFS(file, folder)
        }
        throw err
    }
}

export async function persistUploadedFiles(files, folder = 'images') {
    if (!files?.length) return []
    const urls = await Promise.all(files.map((file) => persistUploadedFile(file, folder)))
    return urls.filter(Boolean)
}

function parseGridFSId(imagePath) {
    const match = imagePath?.match(/\/media\/files\/([a-f0-9]{24})/i)
    return match?.[1] ?? null
}

function parseCloudinaryPublicId(imagePath) {
    if (!imagePath?.includes('res.cloudinary.com')) return null
    const afterUpload = imagePath.split('/upload/')[1]
    if (!afterUpload) return null
    return afterUpload.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '')
}

async function deleteFromGridFS(imagePath) {
    const fileId = parseGridFSId(imagePath)
    if (!fileId) return

    try {
        const bucket = getGridFSBucket()
        await bucket.delete(new mongoose.Types.ObjectId(fileId))
    } catch {
        // file may already be deleted
    }
}

async function deleteFromCloudinary(imagePath) {
    const publicId = parseCloudinaryPublicId(imagePath)
    if (!publicId) return

    configureCloudinary()
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
    } catch {
        // file may already be deleted
    }
}

export async function deleteStoredImage(imagePath) {
    if (!imagePath) return

    if (imagePath.includes('res.cloudinary.com')) {
        await deleteFromCloudinary(imagePath)
        return
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        if (imagePath.includes('/media/files/')) {
            await deleteFromGridFS(imagePath)
            return
        }
        if (isBlobStorage()) {
            try {
                await del(imagePath, { token: process.env.BLOB_READ_WRITE_TOKEN })
            } catch {
                // blob may already be deleted
            }
        }
        return
    }

    if (imagePath.startsWith('/media/files/')) {
        await deleteFromGridFS(imagePath)
        return
    }

    const diskPath = imagePath.startsWith('/uploads')
        ? path.resolve('.' + imagePath)
        : path.resolve(imagePath)

    if (existsSync(diskPath)) {
        try {
            rmSync(diskPath)
        } catch {
            // ignore on read-only filesystems
        }
    }
}
