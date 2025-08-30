/**
 * Search controller with type-safe request handlers
 */
import { Request, Response } from 'express';
export declare class SearchController {
    private searchService;
    constructor();
    searchSpecs(req: Request, res: Response): Promise<void>;
    getSuggestions(req: Request, res: Response): Promise<void>;
    getSearchStats(req: Request, res: Response): Promise<void>;
    optimizeIndex(req: Request, res: Response): Promise<void>;
    validateIntegrity(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=search.controller.d.ts.map