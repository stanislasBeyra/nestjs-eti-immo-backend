import { Test, TestingModule } from '@nestjs/testing';
import { DemarcheurController } from './demarcheur.controller';
import { DemarcheurService } from './demarcheur.service';

describe('DemarcheurController', () => {
  let controller: DemarcheurController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemarcheurController],
      providers: [DemarcheurService],
    }).compile();

    controller = module.get<DemarcheurController>(DemarcheurController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
