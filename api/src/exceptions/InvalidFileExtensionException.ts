import { HttpException, HttpStatus } from '@nestjs/common';

import { Levels } from '../constants/enums/level.enum';
import { LogService } from '../modules/log/services/log.service';

import { FILE_EXIT_CODE } from '../constants/enums/error_code.enum';

export class InvalidFileExtensionException extends HttpException {
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
        errorCode: errorCode ?? FILE_EXIT_CODE.INVALID_EXTENSION,
        message: message ?? 'Invalid Extension.',
      },
      status || HttpStatus.BAD_REQUEST,
    );

    this._logger.writeLog(
      Levels.ERROR,
      method,
      path,
      message ?? 'Invalid Extension.',
    );
  }
}
