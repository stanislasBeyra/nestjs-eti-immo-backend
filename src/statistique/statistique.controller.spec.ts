import { Test, TestingModule } from '@nestjs/testing';
import { StatistiqueController } from './statistique.controller';
import { StatistiqueService } from './statistique.service';

describe('StatistiqueController', () => {
  let controller: StatistiqueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatistiqueController],
      providers: [StatistiqueService],
    }).compile();

    controller = module.get<StatistiqueController>(StatistiqueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
