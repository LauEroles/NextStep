import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvFile } from './entities/cv-file.entity';
import { extname, join } from 'path';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(CvFile)
    private readonly cvRepo: Repository<CvFile>,
  ) {}

  async uploadCv(file: Express.Multer.File, userId: number): Promise<CvFile> {
    const ext = extname(file.originalname).replace('.', ''); // 'pdf'
    const directory = join('uploads', 'cv');

    const cvFile = this.cvRepo.create({
      originalName: file.originalname,
      storedName: file.filename,          
      extension: ext,
      directory,
      userId,
    });

    return this.cvRepo.save(cvFile);
  }

  async getCvsByUser(userId: number): Promise<CvFile[]> {
    return this.cvRepo.find({ where: { userId } });
  }
}