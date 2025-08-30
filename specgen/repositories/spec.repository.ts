/**
 * Spec repository with TypeORM
 */

import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Spec, SpecStatus } from '../entities/Spec.js';
import { getDataSource } from '../database/data-source.js';
import { ListSpecsQuery } from '../types/spec.types.js';

export class SpecRepository {
  private repository: Repository<Spec> | null = null;

  private async getRepository(): Promise<Repository<Spec>> {
    if (!this.repository) {
      const dataSource = await getDataSource();
      this.repository = dataSource.getRepository(Spec);
    }
    return this.repository;
  }

  async findById(id: number, relations?: string[]): Promise<Spec | null> {
    const repo = await this.getRepository();
    return repo.findOne({
      where: { id },
      relations
    });
  }

  async findAll(query: ListSpecsQuery): Promise<{ specs: Spec[]; total: number }> {
    const repo = await this.getRepository();
    
    const where: FindOptionsWhere<Spec> = {};
    if (query.status) {
      where.status = query.status;
    }

    // Map underscore fields to camelCase for TypeORM
    const sortFieldMap: Record<string, string> = {
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'id': 'id',
      'title': 'title'
    };
    
    const sortBy = sortFieldMap[query.sortBy || 'created_at'] || 'createdAt';

    const options: FindManyOptions<Spec> = {
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

  async create(data: Partial<Spec>): Promise<Spec> {
    const repo = await this.getRepository();
    const spec = repo.create(data);
    return repo.save(spec);
  }

  async update(id: number, data: Partial<Spec>): Promise<Spec | null> {
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

  async delete(id: number): Promise<boolean> {
    const repo = await this.getRepository();
    const result = await repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByStatus(status: SpecStatus): Promise<Spec[]> {
    const repo = await this.getRepository();
    return repo.find({
      where: { status },
      order: { createdAt: 'DESC' }
    });
  }

  async countByStatus(status?: SpecStatus): Promise<number> {
    const repo = await this.getRepository();
    if (status) {
      return repo.count({ where: { status } });
    }
    return repo.count();
  }

  async findRecent(limit = 10): Promise<Spec[]> {
    const repo = await this.getRepository();
    return repo.find({
      order: { updatedAt: 'DESC' },
      take: limit
    });
  }

  async findByTitlePattern(pattern: string): Promise<Spec[]> {
    const repo = await this.getRepository();
    return repo
      .createQueryBuilder('spec')
      .where('spec.title LIKE :pattern', { pattern: `%${pattern}%` })
      .orderBy('spec.created_at', 'DESC')
      .getMany();
  }
}