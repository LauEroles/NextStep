// src/cv/entities/cv-file.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn, JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('cv_files')
export class CvFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;   // nombre original que mandó el usuario

  @Column()
  storedName: string;     // nombre con el que se guardó en el servidor 

  @Column()
  extension: string;      // 'pdf', 'docx', etc.

  @Column()
  directory: string;      // ruta relativa: 'uploads/cv'

  @ManyToOne(() => User,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({name: 'user_id', type: 'int'})
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}