import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { JobOffer } from "../../job-offers/entities/job-offer.entity";

@Entity('seniority')
export class Seniority {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    name: string;

    @OneToMany(() => JobOffer, (jobOffer) => jobOffer.seniority)
    jobOffers: JobOffer[];
}
