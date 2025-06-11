import { Test, TestingModule } from '@nestjs/testing';
import { ProprietairesController } from './proprietaires.controller';
import { ProprietairesService } from './proprietaires.service';

describe('ProprietairesController', () => {
  let controller: ProprietairesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProprietairesController],
      providers: [ProprietairesService],
    }).compile();

    controller = module.get<ProprietairesController>(ProprietairesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
