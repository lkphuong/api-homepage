import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { jwtFactory } from './factories/jwt.factory';
import { postgresqlFactory } from './factories/postgresql.factory';
import { staticFactory } from './factories/static.factory';

import { LogModule } from './modules/log/log.module';
import { SharedModule } from './modules/shared/shared.module';

import { AuthModule } from './modules/auth/auth.module';
import { EventModule } from './modules/event/event.module';
import { BannerModule } from './modules/banner/banner.module';
import { FileModule } from './modules/file/file.module';
import { PermissionModule } from './modules/permission/permission.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ScheduleModule } from './modules/schedule/schedule.module';

import { ConfigurationService } from './modules/shared/services/configuration/configuration.service';
import { EmployeeModule } from './modules/employee/employee.module';
import { PositionModule } from './modules/position/position.module';
import { LanguageModule } from './modules/language/language.module';
import { ContentModule } from './modules/content/content.module';
import { FooterModule } from './modules/footer/footer.module';
import { LinkModule } from './modules/link/link.module';

export const modules = [
  SharedModule,
  JwtModule.registerAsync({
    imports: [SharedModule],
    inject: [ConfigurationService],
    useFactory: jwtFactory,
  }),
  ServeStaticModule.forRootAsync({
    imports: [SharedModule],
    inject: [ConfigurationService],
    useFactory: staticFactory,
  }),
  TypeOrmModule.forRootAsync({
    imports: [SharedModule],
    inject: [ConfigurationService],
    useFactory: postgresqlFactory,
  }),
  AuthModule,
  BannerModule,
  ContentModule,
  EmployeeModule,
  EventModule,
  FileModule,
  FooterModule,
  LanguageModule,
  LinkModule,
  LogModule,
  NotificationModule,
  PermissionModule,
  PositionModule,
  ScheduleModule,
  UserModule,
];
