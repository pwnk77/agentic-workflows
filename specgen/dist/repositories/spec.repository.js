/**
 * Spec repository with TypeORM
 */
import { Spec } from '../entities/Spec.js';
import { getDataSource } from '../database/data-source.js';
export class SpecRepository {
    repository = null;
    async getRepository() {
        if (!this.repository) {
            const dataSource = await getDataSource();
            this.repository = dataSource.getRepository(Spec);
        }
        return this.repository;
    }
    async findById(id, relations) {
        const repo = await this.getRepository();
        return repo.findOne({
            where: { id },
            relations
        });
    }
    async findAll(query) {
        const repo = await this.getRepository();
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        // Map underscore fields to camelCase for TypeORM
        const sortFieldMap = {
            'created_at': 'createdAt',
            'updated_at': 'updatedAt',
            'id': 'id',
            'title': 'title'
        };
        const sortBy = sortFieldMap[query.sortBy || 'created_at'] || 'createdAt';
        const options = {
            where,
            take: query.limit || 50,
            skip: query.offset || 0,
            order: {
                [sortBy]: query.sortOrder || 'DESC'
            }
        };
        const [specs, total] = await repo.findAndCount(options);
        return { specs, total };
    }
    async create(data) {
        const repo = await this.getRepository();
        const spec = repo.create(data);
        return repo.save(spec);
    }
    async update(id, data) {
        const repo = await this.getRepository();
        // First check if spec exists
        const existing = await repo.findOne({ where: { id } });
        if (!existing) {
            return null;
        }
        // Update version for optimistic locking
        const updateData = {
            ...data,
            version: existing.version + 1
        };
        await repo.update(id, updateData);
        return repo.findOne({ where: { id } });
    }
    async delete(id) {
        const repo = await this.getRepository();
        const result = await repo.delete(id);
        return (result.affected ?? 0) > 0;
    }
    async findByStatus(status) {
        const repo = await this.getRepository();
        return repo.find({
            where: { status },
            order: { createdAt: 'DESC' }
        });
    }
    async countByStatus(status) {
        const repo = await this.getRepository();
        if (status) {
            return repo.count({ where: { status } });
        }
        return repo.count();
    }
    async findRecent(limit = 10) {
        const repo = await this.getRepository();
        return repo.find({
            order: { updatedAt: 'DESC' },
            take: limit
        });
    }
    async findByTitlePattern(pattern) {
        const repo = await this.getRepository();
        return repo
            .createQueryBuilder('spec')
            .where('spec.title LIKE :pattern', { pattern: `%${pattern}%` })
            .orderBy('spec.created_at', 'DESC')
            .getMany();
    }
}
//# sourceMappingURL=spec.repository.js.map