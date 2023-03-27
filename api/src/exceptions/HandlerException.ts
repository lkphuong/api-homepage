import { HttpException, HttpStatus } from '@nestjs/common';

import { Levels } from '../constants/enums/level.enum';
import { LogService } from '../modules/log/services/log.service';

export class HandlerException extends HttpException {
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
        message: message ?? `Internal Server Error.`,
      },
      status || HttpStatus.INTERNAL_SERVER_ERROR,
    );

    this._logger.writeLog(
      Levels.ERROR,
      method,
      path,
      message ?? `Internal Server Error.`,
    );
  }
}
