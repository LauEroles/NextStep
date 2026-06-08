import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stages')
export class Stage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ name: 'sequence_order', type: 'int', unique: true })
  sequenceOrder: number;

  @Column({ type: 'boolean', name: 'is_terminal' })
  isTerminal: boolean;
}
