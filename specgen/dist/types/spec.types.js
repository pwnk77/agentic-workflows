/**
 * Spec service type definitions
 */
export class SpecNotFoundError extends Error {
    constructor(id) {
        super(`Specification with ID ${id} not found`);
        this.name = 'SpecNotFoundError';
    }
}
export class SpecValidationError extends Error {
    errors;
    constructor(errors) {
        super(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
        this.name = 'SpecValidationError';
        this.errors = errors;
    }
}
//# sourceMappingURL=spec.types.js.map