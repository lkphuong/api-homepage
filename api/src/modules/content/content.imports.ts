import { TypeOrmModule } from '@nestjs/typeorm';

import { ContentEntity } from '../../entities/content.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';

import { ContentService } from './services/content.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([ContentEntity]),
  LogModule,
];

export const controllers = [];

export const providers = [ContentService];

export const exporteds = [ContentService];
