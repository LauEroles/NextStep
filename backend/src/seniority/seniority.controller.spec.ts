import { Test, TestingModule } from '@nestjs/testing';
import { SeniorityController } from './seniority.controller';
import { SeniorityService } from './seniority.service';

describe('SeniorityController', () => {
  let controller: SeniorityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeniorityController],
      providers: [SeniorityService],
    }).compile();

    controller = module.get<SeniorityController>(SeniorityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
