/**
 * ExecLog entity - Execution logs for specification implementations
 */

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import type { Spec } from './Spec.js';

@Entity('exec_logs')
export class ExecLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'spec_id' })
  specId!: number;

  @Column({ type: 'text' })
  layer!: string;

  @Column({ type: 'text' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true, name: 'tasks_completed' })
  tasksCompleted?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne("Spec", { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spec_id' })
  spec!: any;
}