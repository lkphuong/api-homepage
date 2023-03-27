import { Test, TestingModule } from '@nestjs/testing';
import { BannerLanguageService } from './banner_language.service';

describe('BannerLanguageService', () => {
  let service: BannerLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerLanguageService],
    }).compile();

    service = module.get<BannerLanguageService>(BannerLanguageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
