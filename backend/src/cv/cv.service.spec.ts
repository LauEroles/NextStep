import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { CvService } from './cv.service';
import { CvFile } from './entities/cv-file.entity';

describe('CvService', () => {
  let service: CvService;
  let repo: MockProxy<Repository<CvFile>>;

  beforeEach(async () => {
    repo = mock<Repository<CvFile>>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        { provide: getRepositoryToken(CvFile), useValue: repo },
      ],
    }).compile();

    service = module.get(CvService);
  });

  it('uploadCv guarda el archivo', async () => {
    const file = { originalname: 'cv.pdf', filename: 'stored.pdf' } as Express.Multer.File;
const saved = { id: 'uuid-1' } as unknown as CvFile;
    repo.create.mockReturnValue(saved);
    repo.save.mockResolvedValue(saved);

    await expect(service.uploadCv(file, 1)).resolves.toEqual(saved);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalledWith(saved);
  });

  
  
});