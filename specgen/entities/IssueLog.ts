/**
 * IssueLog entity - Issue and error logs for debugging
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

@Entity('issue_logs')
export class IssueLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'spec_id' })
  specId!: number;

  @Column({ type: 'text', name: 'task_id' })
  taskId!: string;

  @Column({ type: 'text', name: 'task_description' })
  taskDescription!: string;

  @Column({ type: 'text' })
  layer!: string;

  @Column({ type: 'text' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'text', nullable: true, name: 'root_cause' })
  rootCause?: string;

  @Column({ type: 'text', nullable: true })
  resolution?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne("Spec", { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spec_id' })
  spec!: any;
}