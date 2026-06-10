import { Test, TestingModule } from '@nestjs/testing';
import { ScorecardsService } from './scorecards.service';

describe('ScorecardsService', () => {
  let service: ScorecardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScorecardsService],
    }).compile();

    service = module.get<ScorecardsService>(ScorecardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
