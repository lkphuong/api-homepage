import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeeEntity } from '../../entities/employee.entity';
import { EmployeeLanguageEntity } from '../../entities/employee_language.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';
import { FileModule } from '../file/file.module';

import { EmployeeController } from './controllers/employee.controller';

import { EmployeeService } from './services/employee/employee.service';
import { EmployeeLanguageService } from './services/employee-language/employee_language.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([EmployeeEntity, EmployeeLanguageEntity]),
  LogModule,
  FileModule,
];

export const controllers = [EmployeeController];

export const providers = [EmployeeService, EmployeeLanguageService];

export const exporteds = [EmployeeService, EmployeeLanguageService];
