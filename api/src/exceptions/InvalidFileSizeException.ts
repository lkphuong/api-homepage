import { HttpException, HttpStatus } from '@nestjs/common';
import { FILE_EXIT_CODE } from '../constants/enums/error_code.enum';

import { Levels } from '../constants/enums/level.enum';
import { LogService } from '../modules/log/services/log.service';

export class InvalidFileSizeException extends HttpException {
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
        errorCode: errorCode ?? FILE_EXIT_CODE.INVALID_SIZE,
        message: message ?? 'File size too large.',
      },
      status || HttpStatus.PAYLOAD_TOO_LARGE,
    );

    this._logger.writeLog(
      Levels.ERROR,
      method,
      path,
      message ?? 'File size too large.',
    );
  }
}
