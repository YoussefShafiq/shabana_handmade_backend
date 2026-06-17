import { NODE_ENV } from "../../../configs/app.config.js"

export function notFoundException(message = 'resource not found') {
    throw new Error(message, { cause: { statusCode: 404 } })
}

export function conflictException(message = 'resource already exists') {
    throw new Error(message, { cause: { statusCode: 409 } })
}

export function notAuthorizedException(message = 'you are not authorized to access this resource') {
    throw new Error(message, { cause: { statusCode: 403 } })
}

export function badRequestException(message = 'bad request') {
    throw new Error(message, { cause: { statusCode: 400 } })
}

export function unhandledException(message = 'unhandled') {
    throw new Error(message, { cause: { statusCode: 500 } })
}

export function globalErrorHandling(err, req, res, next) {
    return NODE_ENV == 'dev' ?
        res.status(err.cause?.statusCode || 500).json({
            success: false,
            message: err.name === 'SequelizeUniqueConstraintError' ? `${err.errors[0]?.path || 'field'} '${err.errors[0]?.value || ''}' already exists` : err.message,
            stack: err.stack,
            err
        })
        :
        res.status(err.cause?.statusCode || 500).json({
            success: false,
            message: err.name === 'SequelizeUniqueConstraintError' ? `${err.errors[0]?.path || 'field'} '${err.errors[0]?.value || ''}' already exists` : err.message,
        })
}
