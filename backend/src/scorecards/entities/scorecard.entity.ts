import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Feedback } from '../../feedback/entities/feedback.entity';

@Entity('scorecards')
export class Scorecard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Feedback, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feedback_id' })
  feedback: Feedback;

  @Column({ type: 'varchar', length: 100 })
  skillName: string;

  @Column({ type: 'int' })
  score: number;

  @Column({
    type: 'enum',
    enum: ['technical', 'soft'],
  })
  type: 'technical' | 'soft';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}