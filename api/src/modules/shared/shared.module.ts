import { Global, Module } from '@nestjs/common';
import { controllers, exporteds, modules, providers } from './shared.imports';

@Global()
@Module({
  imports: modules,
  controllers: controllers,
  providers: providers,
  exports: exporteds,
})
export class SharedModule {}
