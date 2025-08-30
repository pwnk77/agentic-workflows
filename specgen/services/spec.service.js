/**
 * Spec service with business logic and validation
 */
import { z } from 'zod';
import { SpecRepository } from '../repositories/spec.repository.js';
import { SpecNotFoundError, SpecValidationError as ValidationError } from '../types/spec.types.js';
import { logger } from './logging.service.js';
import { getAppSettings } from '../config/settings.js';
// Validation schemas
const createSpecSchema = z.object({
    title: z.string().min(1).max(255).trim(),
    bodyMd: z.string().min(1),
    status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional().default('draft')
});
const updateSpecSchema = z.object({
    title: z.string().min(1).max(255).trim().optional(),
    bodyMd: z.string().min(1).optional(),
    status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});
const listSpecsSchema = z.object({
    limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
    offset: z.coerce.number().int().min(0).optional().default(0),
    status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional(),
    sortBy: z.enum(['id', 'title', 'created_at', 'updated_at']).optional().default('created_at'),
    sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC')
});
export class SpecService {
    repository;
    settings;
    constructor() {
        this.repository = new SpecRepository();
        this.settings = getAppSettings();
    }
    async createSpec(data) {
        logger.debug('Creating new specification', { title: data.title });
        // Validate input
        const validationResult = createSpecSchema.safeParse(data);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                value: err.received || 'invalid'
            }));
            throw new ValidationError(errors);
        }
        const validatedData = validationResult.data;
        // Check content size limit
        if (validatedData.bodyMd.length > this.settings.maxSpecSize) {
            throw new ValidationError([{
                    field: 'bodyMd',
                    message: `Content too large. Maximum size is ${this.settings.maxSpecSize} characters`,
                    value: validatedData.bodyMd.length
                }]);
        }
        try {
            const spec = await this.repository.create({
                title: validatedData.title,
                bodyMd: validatedData.bodyMd,
                status: validatedData.status,
                version: 1
            });
            logger.info('Specification created successfully', {
                id: spec.id,
                title: spec.title,
                status: spec.status
            });
            return spec;
        }
        catch (error) {
            logger.error('Failed to create specification', error, { title: data.title });
            throw error;
        }
    }
    async updateSpec(id, data) {
        logger.debug('Updating specification', { id, ...data });
        // Validate input
        const validationResult = updateSpecSchema.safeParse(data);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                value: err.received || 'invalid'
            }));
            throw new ValidationError(errors);
        }
        const validatedData = validationResult.data;
        // Check content size limit if bodyMd is being updated
        if (validatedData.bodyMd && validatedData.bodyMd.length > this.settings.maxSpecSize) {
            throw new ValidationError([{
                    field: 'bodyMd',
                    message: `Content too large. Maximum size is ${this.settings.maxSpecSize} characters`,
                    value: validatedData.bodyMd.length
                }]);
        }
        try {
            const updatedSpec = await this.repository.update(id, validatedData);
            if (!updatedSpec) {
                throw new SpecNotFoundError(id);
            }
            logger.info('Specification updated successfully', {
                id: updatedSpec.id,
                title: updatedSpec.title,
                version: updatedSpec.version
            });
            return updatedSpec;
        }
        catch (error) {
            if (error instanceof SpecNotFoundError) {
                throw error;
            }
            logger.error('Failed to update specification', error, { id });
            throw error;
        }
    }
    async getSpec(id, includeRelations = false) {
        logger.debug('Retrieving specification', { id });
        try {
            const relations = includeRelations ? ['todos', 'execLogs', 'issueLogs'] : undefined;
            const spec = await this.repository.findById(id, relations);
            if (!spec) {
                throw new SpecNotFoundError(id);
            }
            return spec;
        }
        catch (error) {
            if (error instanceof SpecNotFoundError) {
                throw error;
            }
            logger.error('Failed to retrieve specification', error, { id });
            throw error;
        }
    }
    async listSpecs(query = {}) {
        logger.debug('Listing specifications', query);
        // Validate query parameters
        const validationResult = listSpecsSchema.safeParse(query);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
                value: err.received || 'invalid'
            }));
            throw new ValidationError(errors);
        }
        const validatedQuery = validationResult.data;
        try {
            const { specs, total } = await this.repository.findAll(validatedQuery);
            const response = {
                specs,
                total,
                limit: validatedQuery.limit,
                offset: validatedQuery.offset,
                hasMore: validatedQuery.offset + specs.length < total
            };
            logger.debug('Specifications retrieved successfully', {
                count: specs.length,
                total,
                hasMore: response.hasMore
            });
            return response;
        }
        catch (error) {
            logger.error('Failed to list specifications', error, query);
            throw error;
        }
    }
    async deleteSpec(id) {
        logger.debug('Deleting specification', { id });
        try {
            const deleted = await this.repository.delete(id);
            if (!deleted) {
                throw new SpecNotFoundError(id);
            }
            logger.info('Specification deleted successfully', { id });
        }
        catch (error) {
            if (error instanceof SpecNotFoundError) {
                throw error;
            }
            logger.error('Failed to delete specification', error, { id });
            throw error;
        }
    }
    async getSpecsByStatus(status) {
        logger.debug('Retrieving specifications by status', { status });
        try {
            const specs = await this.repository.findByStatus(status);
            logger.debug(`Found ${specs.length} specifications with status: ${status}`);
            return specs;
        }
        catch (error) {
            logger.error('Failed to retrieve specifications by status', error, { status });
            throw error;
        }
    }
    async getSpecStats() {
        logger.debug('Retrieving specification statistics');
        try {
            const [total, draft, todo, inProgress, done] = await Promise.all([
                this.repository.countByStatus(),
                this.repository.countByStatus('draft'),
                this.repository.countByStatus('todo'),
                this.repository.countByStatus('in-progress'),
                this.repository.countByStatus('done')
            ]);
            const stats = {
                total,
                byStatus: {
                    draft,
                    todo,
                    'in-progress': inProgress,
                    done
                }
            };
            logger.debug('Specification statistics retrieved', stats);
            return stats;
        }
        catch (error) {
            logger.error('Failed to retrieve specification statistics', error);
            throw error;
        }
    }
    async searchSpecsByTitle(pattern) {
        logger.debug('Searching specifications by title', { pattern });
        if (!pattern.trim()) {
            throw new ValidationError([{
                    field: 'pattern',
                    message: 'Search pattern cannot be empty',
                    value: pattern
                }]);
        }
        try {
            const specs = await this.repository.findByTitlePattern(pattern.trim());
            logger.debug(`Found ${specs.length} specifications matching title pattern`);
            return specs;
        }
        catch (error) {
            logger.error('Failed to search specifications by title', error, { pattern });
            throw error;
        }
    }
}
