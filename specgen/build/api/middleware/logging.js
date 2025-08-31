/**
 * Request logging middleware
 */
import morgan from 'morgan';
import { logger } from '../../services/logging.service.js';
// Custom morgan token for response time
morgan.token('res-time', (req, res) => {
    const responseTime = res.getHeader('X-Response-Time');
    return responseTime ? `${responseTime}ms` : '-';
});
// Custom morgan format
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';
export const requestLogger = morgan(morganFormat, {
    stream: {
        write: (message) => {
            logger.info(message.trim());
        }
    },
    skip: (req) => {
        // Skip health check and static asset requests in production
        return req.url === '/health' || req.url.startsWith('/static/');
    }
});
// Response time middleware
export function responseTime(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (!res.headersSent) {
            res.setHeader('X-Response-Time', duration);
        }
    });
    next();
}
// Request ID middleware for tracing
export function requestId(req, res, next) {
    const id = Math.random().toString(36).substring(2, 15);
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-ID', id);
    next();
}
//# sourceMappingURL=logging.js.map