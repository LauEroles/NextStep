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

  @Column({ type: 'int', nullable: true })
  technical_score: number;

  @Column({ type: 'int', nullable: true })
  soft_skills_score: number;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
