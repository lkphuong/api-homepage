import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationEntity } from '../../entities/notification.entity';
import { NotificationLanguageEntity } from '../../entities/notification_language.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';

import { NotificationController } from './controllers/notification.controller';

import { NotificationService } from './services/notification/notification.service';
import { NotificationLanguageService } from './services/notification-language/notification_language.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([NotificationEntity, NotificationLanguageEntity]),
  LogModule,
];

export const controllers = [NotificationController];

export const providers = [NotificationService, NotificationLanguageService];

export const exporteds = [NotificationService, NotificationLanguageService];
