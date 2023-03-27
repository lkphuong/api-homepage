import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleEntity } from '../../entities/schedule.entity';
import { ScheduleLanguageEntity } from '../../entities/schedule_language.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';
import { FileModule } from '../file/file.module';

import { ScheduleController } from './controllers/schedule.controller';

import { ScheduleService } from './services/schedule/schedule.service';
import { ScheduleLanguageService } from './services/schedule-language/schedule_language.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([ScheduleEntity, ScheduleLanguageEntity]),
  LogModule,
  FileModule,
];

export const controllers = [ScheduleController];

export const providers = [ScheduleService, ScheduleLanguageService];

export const exporteds = [ScheduleService, ScheduleLanguageService];
