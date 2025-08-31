/**
 * Async route handler wrapper to catch errors
 */
import { Request, Response, NextFunction } from 'express';
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare function asyncHandler(fn: AsyncHandler): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=async-handler.d.ts.map