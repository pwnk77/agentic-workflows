/**
 * Request logging middleware
 */
import { Request, Response, NextFunction } from 'express';
export declare const requestLogger: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("http").ServerResponse<import("http").IncomingMessage>, callback: (err?: Error) => void) => void;
export declare function responseTime(req: Request, res: Response, next: NextFunction): void;
export declare function requestId(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=logging.d.ts.map