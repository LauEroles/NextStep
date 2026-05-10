import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JobApplicationStage } from '../enums/job-application-stage.enum';
import { JobOffer } from '../../job-offers/entities/job-offer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JobOffer)
  @JoinColumn({ name: 'jobOffer_id' })
  jobOffer: JobOffer;

  @Column()
  jobOffer_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'candidate_id' })
  candidate: User;

  @Column()
  candidate_id: number;

  @Column({
    type: 'enum',
    enum: JobApplicationStage,
    default: JobApplicationStage.APPLIED,
  })
  status: JobApplicationStage;

  @OneToMany(() => Feedback)
  feedback: Feedback[];
}
