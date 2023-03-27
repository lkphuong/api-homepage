import { TypeOrmModule } from '@nestjs/typeorm';

import { EventEntity } from '../../entities/event.entity';
import { EventLanguageEntity } from '../../entities/event_language.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';
import { FileModule } from '../file/file.module';

import { EventController } from './controllers/event.controller';

import { EventService } from './services/event/event.service';
import { EventLanguageService } from './services/event_language/event_language.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([EventEntity, EventLanguageEntity]),
  LogModule,
  FileModule,
];

export const controllers = [EventController];

export const providers = [EventService, EventLanguageService];

export const exporteds = [EventService, EventLanguageService];
