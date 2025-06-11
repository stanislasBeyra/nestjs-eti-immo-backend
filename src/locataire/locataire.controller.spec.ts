import { Test, TestingModule } from '@nestjs/testing';
import { LocataireController } from './locataire.controller';
import { LocataireService } from './locataire.service';

describe('LocataireController', () => {
  let controller: LocataireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocataireController],
      providers: [LocataireService],
    }).compile();

    controller = module.get<LocataireController>(LocataireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
