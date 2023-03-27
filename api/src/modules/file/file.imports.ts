import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';

import { multerFactory } from '../../factories/multer.factory';

import { FileEntity } from '../../entities/file.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';

import { FilesController } from './controllers/files.controller';

import { FilesService } from './services/files.service';
import { ConfigurationService } from '../shared/services/configuration/configuration.service';

export const modules = [
  SharedModule,
  MulterModule.registerAsync({
    imports: [SharedModule],
    useFactory: multerFactory,
    inject: [ConfigurationService],
  }),
  TypeOrmModule.forFeature([FileEntity]),
  LogModule,
];

export const controllers = [FilesController];

export const providers = [FilesService];

export const exporteds = [FilesService];
