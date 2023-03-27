import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../entities/user.entity';

import { LogModule } from '../log/log.module';
import { PermissionModule } from '../permission/permission.module';
import { SharedModule } from '../shared/shared.module';

import { UserController } from './controllers/user.controller';

import { UserService } from './services/user.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([UserEntity]),
  LogModule,
  PermissionModule,
];

export const controllers = [UserController];

export const providers = [UserService];

export const exporteds = [UserService];
