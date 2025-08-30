/**
 * Todo entity - Task items associated with specifications
 */

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  JoinColumn
} from 'typeorm';
import type { Spec } from './Spec.js';

export type TodoStatus = 'pending' | 'in-progress' | 'completed';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'spec_id' })
  specId!: number;

  @Column({ type: 'integer', nullable: true, name: 'step_no' })
  stepNo?: number;

  @Column({ type: 'text', nullable: true })
  text?: string;

  @Column({ type: 'text', default: 'pending' })
  status!: TodoStatus;

  @ManyToOne("Spec", { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spec_id' })
  spec!: any;
}