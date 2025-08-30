/**
 * Spec controller with type-safe request handlers
 */
import { Request, Response } from 'express';
export declare class SpecController {
    private specService;
    constructor();
    listSpecs(req: Request, res: Response): Promise<void>;
    getSpec(req: Request, res: Response): Promise<void>;
    createSpec(req: Request, res: Response): Promise<void>;
    updateSpec(req: Request, res: Response): Promise<void>;
    deleteSpec(req: Request, res: Response): Promise<void>;
    getSpecStats(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=spec.controller.d.ts.map