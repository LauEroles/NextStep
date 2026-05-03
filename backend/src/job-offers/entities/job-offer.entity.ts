import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Seniority } from '../enums/seniority.enum';
import { JobOfferStatus } from '../enums/job-offers.enum';

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: Seniority,
  })
  seniority: Seniority;

  @Column({ type: 'varchar', length: 500 })
  skills_required: string;

  @Column({
    type: 'enum',
    enum: JobOfferStatus,
    default: JobOfferStatus.ACTIVE,
  })
  status: JobOfferStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recruiter_id' })
  recruiter: User;

  @Column()
  recruiter_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}