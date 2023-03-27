import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleLanguageService } from './schedule_language.service';

describe('ScheduleLanguageService', () => {
  let service: ScheduleLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleLanguageService],
    }).compile();

    service = module.get<ScheduleLanguageService>(ScheduleLanguageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
