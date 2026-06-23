import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { put, del } from '@vercel/blob'

export function isCloudStorage() {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function sanitizeFileName(originalName) {
    const base = path.basename(originalName || 'image')
    return base.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function persistUploadedFile(file, folder = 'images') {
    if (!file?.buffer?.length) return null

    const fileName = `${randomUUID()}_${sanitizeFileName(file.originalname)}`

    if (isCloudStorage()) {
        const blob = await put(`${folder}/${fileName}`, file.buffer, {
            access: 'public',
            contentType: file.mimetype || 'application/octet-stream',
            addRandomSuffix: false,
        })
        return blob.url
    }

    const dir = path.resolve(`./uploads/${folder}`)
    mkdirSync(dir, { recursive: true })
    const fullPath = path.join(dir, fileName)
    writeFileSync(fullPath, file.buffer)
    return `/uploads/${folder}/${fileName}`
}

export async function persistUploadedFiles(files, folder = 'images') {
    if (!files?.length) return []
    const urls = await Promise.all(files.map((file) => persistUploadedFile(file, folder)))
    return urls.filter(Boolean)
}

export async function deleteStoredImage(imagePath) {
    if (!imagePath) return

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        if (!isCloudStorage()) return
        try {
            await del(imagePath)
        } catch {
            // blob may already be deleted
        }
        return
    }

    const diskPath = imagePath.startsWith('/uploads')
        ? path.resolve('.' + imagePath)
        : path.resolve(imagePath)

    if (existsSync(diskPath)) {
        try {
            rmSync(diskPath)
        } catch {
            // ignore on read-only filesystems (e.g. Vercel serverless)
        }
    }
}
