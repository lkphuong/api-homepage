import { TypeOrmModule } from '@nestjs/typeorm';

import { BannerEntity } from '../../entities/banner.entity';
import { BannerLanguageEntity } from '../../entities/banner_language.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';
import { FileModule } from '../file/file.module';

import { BannerController } from './controllers/banner.controller';

import { BannerService } from './services/banner/banner.service';
import { BannerLanguageService } from './services/banner-language/banner_language.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([BannerEntity, BannerLanguageEntity]),
  LogModule,
  FileModule,
];

export const controllers = [BannerController];

export const providers = [BannerService, BannerLanguageService];

export const exporteds = [BannerService, BannerLanguageService];
