import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogModule } from '../log/log.module';
import { SharedModule } from '../shared/shared.module';
import { PermissionModule } from '../permission/permission.module';
import { UserModule } from '../user/user.module';

import { SessionEntity } from '../../entities/session.entity';
import { UserEntity } from '../../entities/user.entity';

import { AuthController } from './controllers/auth.controller';

import { AuthService } from './services/auth.service';
import { ConfigurationService } from '../shared/services/configuration/configuration.service';

import { jwtFactory } from '../../factories/jwt.factory';

import { RolesGuard } from './guards/role.guard';
import { JwtStrategy } from './strategy/jwt';

export const modules = [
  SharedModule,
  TypeOrmModule.forFeature([SessionEntity, UserEntity]),
  JwtModule.registerAsync({
    imports: [SharedModule],
    inject: [ConfigurationService],
    useFactory: jwtFactory,
  }),
  PassportModule,
  LogModule,
  PermissionModule,
  UserModule,
];

export const controllers = [AuthController];
export const providers = [AuthService, JwtStrategy];
export const exporteds = [AuthService];
