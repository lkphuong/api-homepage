import {
  Controller,
  Get,
  HttpException,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { generateArraySuccessResponse } from '../utils';

import { PermissionService } from '../services/permission/permission.service';
import { LogService } from '../../log/services/log.service';

import { HttpResponse } from '../../../interfaces/http_response.interface';
import { PermissionResponse } from '../interfaces/permission_response.interface';

import { HandlerException } from '../../../exceptions/HandlerException';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { ErrorMessage } from '../constants/enums/errors.enum';
import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { Levels } from '../../../constants/enums/level.enum';

@Controller('permissions')
export class PermissionController {
  constructor(
    private _logger: LogService,
    private readonly _permissionService: PermissionService,
  ) {}

  /**
   * @method GET
   * @url api/permissions
   * @return HttpResponse<PermissionResponse> | HttpException
   * @description
   * @page
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getAllPermission(
    @Req() req: Request,
  ): Promise<HttpResponse<PermissionResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url);

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      const permissions = await this._permissionService.getPermissions();

      if (permissions && permissions.length > 0) {
        return generateArraySuccessResponse(permissions, req);
      } else {
        //#region throw HandlerException
        throw new HandlerException(
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          ErrorMessage.NO_CONTENT,
        );
        //#endregion
      }
    } catch (err) {
      console.log(err);
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + err.message);

      if (err instanceof HttpException) throw err;
      else {
        throw new HandlerException(
          SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
          req.method,
          req.url,
        );
      }
    }
  }
}
