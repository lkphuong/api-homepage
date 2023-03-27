import { Module } from '@nestjs/common';
import {
  controllers,
  exporteds,
  modules,
  providers,
} from './permission.imports';

@Module({
  imports: modules,
  controllers: controllers,
  providers: providers,
  exports: exporteds,
})
export class PermissionModule {}
