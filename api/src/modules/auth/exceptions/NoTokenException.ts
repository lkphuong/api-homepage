import { HttpException, HttpStatus } from '@nestjs/common';

import { Levels } from '../../../constants/enums/level.enum';
import { LogService } from '../../log/services/log.service';

export class NoTokenException extends HttpException {
  private _logger = new LogService();

  constructor(
    errorCode?: number,
    method?: string,
    path?: string,
    message?: string,
    status?: HttpStatus,
  ) {
    super(
      {
        errorCode: errorCode ?? 0,
        message: message ?? `No token.`,
      },
      status || HttpStatus.UNAUTHORIZED,
    );

    this._logger.writeLog(Levels.ERROR, method, path, message ?? `No token.`);
  }
}
