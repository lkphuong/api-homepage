import { TypeOrmModule } from '@nestjs/typeorm';

import { LanguageEntity } from '../../entities/language.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';

import { LanguageController } from './controllers/language.controller';

import { LanguageService } from './services/language.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([LanguageEntity]),
  LogModule,
];

export const controllers = [LanguageController];

export const providers = [LanguageService];

export const exporteds = [LanguageService];
