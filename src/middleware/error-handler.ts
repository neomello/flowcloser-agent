import { Request, Response, NextFunction } from 'express';
import { FlowCloserError } from '../utils/errors.js';

/**
 * Middleware global de tratamento de erros
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(`❌ [Error]: ${err.message}`, {
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        path: req.path,
        method: req.method
    });

    if (err instanceof FlowCloserError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                code: err.code,
                context: err.context
            }
        });
    }

    // Erro genérico
    return res.status(500).json({
        error: {
            message: 'Internal Server Error',
            code: 'INTERNAL_SERVER_ERROR'
        }
    });
}
