import { Module } from '@nestjs/common';
import { controllers, exporteds, modules, providers } from './file.imports';

@Module({
  imports: modules,
  controllers: controllers,
  providers: providers,
  exports: exporteds,
})
export class FileModule {}
