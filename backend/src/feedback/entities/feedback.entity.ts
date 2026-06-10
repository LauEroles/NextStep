import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobApplication } from '../../job-applications/entities/job-application.entity';
import { Stage } from '../../stages/entities/stage.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JobApplication)
  @JoinColumn({ name: 'application_id' })
  application: JobApplication;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recruiter_id' })
  recruiter: User;

  @ManyToOne(() => Stage)
  @JoinColumn({ name: 'stage_id' })
  stage: Stage;

  @Column({ type: 'int', nullable: true , name: 'technical_score' })
  technicalScore: number;

  @Column({ type: 'int', nullable: true , name: 'soft_skills_score' })
  softSkillsScore: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'text', nullable: true, name: 'internal_notes' })
  internalNotes: string;

  @Column({ type: 'text', nullable: true, name: 'public_feedback' })
  publicFeedback: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
