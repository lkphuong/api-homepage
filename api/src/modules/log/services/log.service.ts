import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

import { Levels } from '../../../constants/enums/level.enum';

import { writeFile } from '../../../utils/log';

@Injectable({ scope: Scope.TRANSIENT })
export class LogService extends ConsoleLogger {
  writeLog(level: Levels, method: string, path: string, message: string) {
    const data = `[${level}] ${new Date().toISOString()}: [${method} ${path}] ${message}\r\n`;
    writeFile(data);
  }
}
