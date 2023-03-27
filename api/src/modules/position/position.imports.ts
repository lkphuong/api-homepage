import { TypeOrmModule } from '@nestjs/typeorm';

import { PositionEntity } from '../../entities/position.entity';
import { PositionLanguageEntity } from '../../entities/position_language.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';

import { PositionController } from './controllers/position.controller';

import { PositionService } from './services/position/position.service';
import { PositionLanguageService } from './services/position_language/position_language.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([PositionEntity, PositionLanguageEntity]),
  LogModule,
];

export const controllers = [PositionController];

export const providers = [PositionService, PositionLanguageService];

export const exporteds = [PositionService, PositionLanguageService];
