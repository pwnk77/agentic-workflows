/**
 * Spec entity - Main specification document
 */

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import type { Todo } from './Todo.js';
import type { ExecLog } from './ExecLog.js';
import type { IssueLog } from './IssueLog.js';

export type SpecStatus = 'draft' | 'todo' | 'in-progress' | 'done';

@Entity('specs')
export class Spec {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', name: 'body_md' })
  bodyMd!: string;

  @Column({ type: 'text', default: 'draft' })
  status!: SpecStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @OneToMany('Todo', (todo: any) => todo.spec, { cascade: true })
  todos!: any[];

  @OneToMany('ExecLog', (log: any) => log.spec, { cascade: true })
  execLogs!: any[];

  @OneToMany('IssueLog', (issue: any) => issue.spec, { cascade: true })
  issueLogs!: any[];
}