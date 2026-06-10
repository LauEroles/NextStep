import { Test, TestingModule } from '@nestjs/testing';
import { ScorecardsController } from './scorecards.controller';
import { ScorecardsService } from './scorecards.service';

describe('ScorecardsController', () => {
  let controller: ScorecardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScorecardsController],
      providers: [ScorecardsService],
    }).compile();

    controller = module.get<ScorecardsController>(ScorecardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
