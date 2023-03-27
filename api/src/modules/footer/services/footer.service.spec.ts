import { Test, TestingModule } from '@nestjs/testing';
import { FooterService } from './footer.service';

describe('FooterService', () => {
  let service: FooterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FooterService],
    }).compile();

    service = module.get<FooterService>(FooterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
