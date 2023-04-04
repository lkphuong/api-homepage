import { TypeOrmModule } from '@nestjs/typeorm';

import { FooterLanguageEntity } from '../../entities/footer_language.entity';
import { ContentEntity } from '../../entities/content.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';
import { FileModule } from '../file/file.module';
import { ContentModule } from '../content/content.module';

import { FooterController } from './controllers/footer.controller';

import { FooterService } from './services/footer.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([FooterLanguageEntity, ContentEntity]),
  LogModule,
  FileModule,
  ContentModule,
];

export const controllers = [FooterController];

export const providers = [FooterService];

export const exporteds = [FooterService];
