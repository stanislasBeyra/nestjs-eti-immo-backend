import { Test, TestingModule } from '@nestjs/testing';
import { ProprietairesService } from './proprietaires.service';

describe('ProprietairesService', () => {
  let service: ProprietairesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProprietairesService],
    }).compile();

    service = module.get<ProprietairesService>(ProprietairesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
