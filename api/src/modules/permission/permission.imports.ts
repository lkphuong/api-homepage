import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionEntity } from '../../entities/permission.entity';
import { UserPermissionEntity } from '../../entities/user_permission.entity';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';

import { PermissionController } from './controllers/permission.controller';

import { PermissionService } from './services/permission/permission.service';
import { UserPermissionService } from './services/user-permission/user-permission.service';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([PermissionEntity, UserPermissionEntity]),
  LogModule,
];

export const controllers = [PermissionController];

export const providers = [UserPermissionService, PermissionService];

export const exporteds = [UserPermissionService, PermissionService];
