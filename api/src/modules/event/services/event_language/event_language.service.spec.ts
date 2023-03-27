import { Test, TestingModule } from '@nestjs/testing';
import { EventLanguageService } from './event_language.service';

describe('EventLanguageService', () => {
  let service: EventLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventLanguageService],
    }).compile();

    service = module.get<EventLanguageService>(EventLanguageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
