/**
 * Global error handling middleware
 */
import { Request, Response, NextFunction } from 'express';
export declare function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=error-handler.d.ts.map