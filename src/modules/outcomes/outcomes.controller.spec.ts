import { Test, TestingModule } from '@nestjs/testing';
import { OutcomesController } from './outcomes.controller';

describe('OutcomesController', () => {
  let controller: OutcomesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OutcomesController],
    }).compile();

    controller = module.get<OutcomesController>(OutcomesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
