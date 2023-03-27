import { ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { convertString2JSON } from '../utils/string.utils';

import { ConfigurationService } from '../modules/shared/services/configuration/configuration.service';
import { LogService } from '../modules/log/services/log.service';

import { HttpResponse } from '../interfaces/http_response.interface';

import { Levels } from '../constants/enums/level.enum';

import {
  AUTHORIZATION_EXIT_CODE,
  VALIDATION_EXIT_CODE,
} from '../constants/enums/error_code.enum';

export class HttpExceptionFilter implements ExceptionFilter {
  private _logger = new LogService();

  constructor(private readonly _configurationService: ConfigurationService) {}

  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let status = 500;
    let errorCode = 6001;
    let message = null;

    console.log('err: ', error.response);

    if (error.response) {
      status = error.response.status ?? error.getStatus();
      if (error.response.statusCode == HttpStatus.FORBIDDEN) {
        errorCode = AUTHORIZATION_EXIT_CODE.ACCESS_DENIED;
      } else {
        errorCode = error.response.errorCode;
      }
      message = error.response.message ?? error.message;
    } else {
      message = error.message;
    }

    const data = convertString2JSON(message);
    let response: HttpResponse<null> = null;

    response = {
      data: null,
      errorCode: errorCode ?? VALIDATION_EXIT_CODE.EMPTY,
      message: Object.keys(data).length > 0 ? null : message,
      errors: Object.keys(data).length > 0 ? data : null,
    };

    this._logger.writeLog(
      Levels.ERROR,
      req.method,
      req.url,
      message ?? `Internal Server Error.`,
    );

    return res.status(status).json(response);
  }
}
