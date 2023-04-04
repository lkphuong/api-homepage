import { TypeOrmModule } from '@nestjs/typeorm';

import { LinkLanguageEntity } from '../../entities/link_language.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';

import { LinkController } from './controllers/link.controller';

import { LinkService } from './services/link.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([LinkLanguageEntity]),
  LogModule,
];

export const controllers = [LinkController];

export const providers = [LinkService];

export const exporteds = [LinkService];
