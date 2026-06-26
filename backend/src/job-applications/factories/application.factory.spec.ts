import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { ApplicationFactory } from './application.factory';
import { JobApplication } from '../entities/job-application.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { Stage } from '../../stages/entities/stage.entity';

describe('ApplicationFactory', () => {
  let factory: ApplicationFactory;
  let applicationRepo: MockProxy<Repository<JobApplication>>;
  let feedbackRepo: MockProxy<Repository<Feedback>>;

  const stages = [
    { id: 1, name: 'Postulado', isTerminal: false } as Stage,
    { id: 2, name: 'Aprobado', isTerminal: true } as Stage,
  ];

  beforeEach(async () => {
    applicationRepo = mock<Repository<JobApplication>>();
    feedbackRepo = mock<Repository<Feedback>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationFactory,
        { provide: getRepositoryToken(JobApplication), useValue: applicationRepo },
        { provide: getRepositoryToken(Feedback), useValue: feedbackRepo },
      ],
    }).compile();

    factory = module.get(ApplicationFactory);
  });

  it('crea application y feedbacks para stages no terminales', async () => {
    const created = { id: 99 } as JobApplication;
    applicationRepo.create.mockReturnValue(created);
    applicationRepo.save.mockResolvedValue(created);
    feedbackRepo.save.mockResolvedValue({} as Feedback);

    const result = await factory.create(1, 2, stages[0], stages);

    expect(result).toEqual(created);
    expect(feedbackRepo.save).toHaveBeenCalledTimes(1);
  });
});