import { Test, TestingModule } from '@nestjs/testing';
import { PositionLanguageService } from './position_language.service';

describe('PositionLanguageService', () => {
  let service: PositionLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PositionLanguageService],
    }).compile();

    service = module.get<PositionLanguageService>(PositionLanguageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
