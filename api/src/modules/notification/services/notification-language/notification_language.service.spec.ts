import { Test, TestingModule } from '@nestjs/testing';
import { NotificationLanguageService } from './notification_language.service';

describe('NotificationLanguageService', () => {
  let service: NotificationLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationLanguageService],
    }).compile();

    service = module.get<NotificationLanguageService>(
      NotificationLanguageService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
