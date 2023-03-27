import { Module } from '@nestjs/common';
import { exporteds, providers } from './log.imports';

@Module({
  providers: providers,
  exports: exporteds,
})
export class LogModule {}
