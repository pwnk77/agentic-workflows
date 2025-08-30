/**
 * Search service type definitions
 */
export class SearchValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SearchValidationError';
    }
}
