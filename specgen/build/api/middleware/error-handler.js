/**
 * Global error handling middleware
 */
import { logger } from '../../services/logging.service.js';
import { SpecNotFoundError, SpecValidationError } from '../../types/spec.types.js';
import { SearchValidationError } from '../../types/search.types.js';
export function errorHandler(error, req, res, next) {
    // Log error for debugging
    logger.error('API Error', error, {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body
    });
    // Handle specific error types
    if (error instanceof SpecNotFoundError) {
        res.status(404).json({
            success: false,
            error: 'Resource not found',
            message: error.message,
            timestamp: new Date().toISOString()
        });
        return;
    }
    if (error instanceof SpecValidationError || error instanceof SearchValidationError) {
        res.status(400).json({
            success: false,
            error: 'Validation error',
            message: error.message,
            details: error instanceof SpecValidationError ? error.errors : undefined,
            timestamp: new Date().toISOString()
        });
        return;
    }
    // Handle validation errors from Zod (if they slip through)
    if (error.name === 'ZodError') {
        res.status(400).json({
            success: false,
            error: 'Validation error',
            message: 'Invalid request data',
            timestamp: new Date().toISOString()
        });
        return;
    }
    // Handle database connection errors
    if (error.message.includes('SQLITE_') || error.message.includes('database')) {
        res.status(503).json({
            success: false,
            error: 'Database error',
            message: 'Database temporarily unavailable',
            timestamp: new Date().toISOString()
        });
        return;
    }
    // Default internal server error
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    });
}
export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
}
//# sourceMappingURL=error-handler.js.map