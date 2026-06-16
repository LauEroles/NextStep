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
import { Seniority } from '../../seniority/entities/seniority.entity';

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Seniority)
  @JoinColumn({ name: 'seniority_id' })
  seniority: Seniority;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recruiter_id' })
  recruiter: User;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
