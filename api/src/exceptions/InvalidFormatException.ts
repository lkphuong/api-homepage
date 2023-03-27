import { HttpException, HttpStatus } from '@nestjs/common';

import { Levels } from '../constants/enums/level.enum';
import { LogService } from '../modules/log/services/log.service';

import { FILE_EXIT_CODE } from '../constants/enums/error_code.enum';

export class InvalidFormatException extends HttpException {
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
        errorCode: errorCode ?? FILE_EXIT_CODE.INVALID_NAME,
        message: message ?? 'Invalid Format.',
      },
      status || HttpStatus.BAD_REQUEST,
    );

    this._logger.writeLog(
      Levels.ERROR,
      method,
      path,
      message ?? 'Invalid Format.',
    );
  }
}
