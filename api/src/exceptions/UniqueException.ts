import { HttpException, HttpStatus } from '@nestjs/common';
import { DATABASE_EXIT_CODE } from '../constants/enums/error_code.enum';

import { Levels } from '../constants/enums/level.enum';
import { LogService } from '../modules/log/services/log.service';

export class UniqueException extends HttpException {
  private _logger = new LogService();

  constructor(
    code: string | number,
    errorCode?: number,
    method?: string,
    path?: string,
    message?: string,
    status?: HttpStatus,
  ) {
    super(
      {
        errorCode: errorCode ?? DATABASE_EXIT_CODE.UNIQUE_FIELD_VALUE,
        message: message ?? `Unique value (code: ${code}).`,
      },
      status || HttpStatus.AMBIGUOUS,
    );

    this._logger.writeLog(
      Levels.ERROR,
      method,
      path,
      message ?? `Unique value (code: ${code}).`,
    );
  }
}
