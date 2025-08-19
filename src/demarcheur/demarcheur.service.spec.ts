import { Test, TestingModule } from '@nestjs/testing';
import { DemarcheurService } from './demarcheur.service';

describe('DemarcheurService', () => {
  let service: DemarcheurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemarcheurService],
    }).compile();

    service = module.get<DemarcheurService>(DemarcheurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
