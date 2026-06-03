import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobOffer } from '../../job-offers/entities/job-offer.entity';
import { User } from '../../users/entities/user.entity';
import { Stage } from '../../stages/entities/stage.entity';

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JobOffer)
  @JoinColumn({ name: 'jobOffer_id' })
  jobOffer: JobOffer;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'applicant_id' })
  applicant: User;

  @ManyToOne(() => Stage)
  @JoinColumn({ name: 'current_stage_id' })
  currentStage: Stage;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
