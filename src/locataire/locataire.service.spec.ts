import { Test, TestingModule } from '@nestjs/testing';
import { LocataireService } from './locataire.service';

describe('LocataireService', () => {
  let service: LocataireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocataireService],
    }).compile();

    service = module.get<LocataireService>(LocataireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
