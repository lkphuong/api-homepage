import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeLanguageService } from './employee_language.service';

describe('EmployeeLanguageService', () => {
  let service: EmployeeLanguageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeLanguageService],
    }).compile();

    service = module.get<EmployeeLanguageService>(EmployeeLanguageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
