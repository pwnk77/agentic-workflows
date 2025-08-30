/**
 * Request validation middleware using Zod
 */
import { z } from 'zod';
import { logger } from '../../services/logging.service.js';
export function validate(schemas) {
    return (req, res, next) => {
        try {
            // Validate request body
            if (schemas.body) {
                const bodyResult = schemas.body.safeParse(req.body);
                if (!bodyResult.success) {
                    res.status(400).json({
                        success: false,
                        error: 'Validation error',
                        details: bodyResult.error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                            value: err.received || 'invalid'
                        })),
                        timestamp: new Date().toISOString()
                    });
                    return;
                }
                req.body = bodyResult.data;
            }
            // Validate query parameters
            if (schemas.query) {
                const queryResult = schemas.query.safeParse(req.query);
                if (!queryResult.success) {
                    res.status(400).json({
                        success: false,
                        error: 'Query validation error',
                        details: queryResult.error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                            value: err.received || 'invalid'
                        })),
                        timestamp: new Date().toISOString()
                    });
                    return;
                }
                req.query = queryResult.data;
            }
            // Validate path parameters
            if (schemas.params) {
                const paramsResult = schemas.params.safeParse(req.params);
                if (!paramsResult.success) {
                    res.status(400).json({
                        success: false,
                        error: 'Parameter validation error',
                        details: paramsResult.error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                            value: err.received || 'invalid'
                        })),
                        timestamp: new Date().toISOString()
                    });
                    return;
                }
                req.params = paramsResult.data;
            }
            next();
        }
        catch (error) {
            logger.error('Validation middleware error', error);
            res.status(500).json({
                success: false,
                error: 'Internal validation error',
                timestamp: new Date().toISOString()
            });
        }
    };
}
// Common validation schemas
export const idParamSchema = z.object({
    id: z.coerce.number().int().positive()
});
export const paginationQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0)
});
export const sortQuerySchema = z.object({
    sort_by: z.enum(['id', 'title', 'created_at', 'updated_at']).optional().default('created_at'),
    sort_order: z.enum(['asc', 'desc']).optional().default('desc')
});
//# sourceMappingURL=validation.js.map