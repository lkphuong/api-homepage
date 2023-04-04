import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSource } from 'typeorm';

import { returnObjects, sprintf } from '../../../utils';
import { generateArraySuccessResponse } from '../utils';
import {
  generateFailedResponse,
  generateSuccessResponse,
} from '../../auth/utils';

import { UpdateAccount } from '../funcs';

import { LogService } from '../../log/services/log.service';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { UserService } from '../services/user.service';
import { PermissionService } from '../../permission/services/permission/permission.service';

import { GetUsersDto } from '../dtos/get_user.dto';
import { UpdateUserDto } from '../dtos/update.dto';

import { validateUserId } from '../validations';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { UserResponse } from '../interfaces/user_response.interface';
import { HttpResponse } from '../../../interfaces/http_response.interface';
import { HttpPagingResponse } from '../../../interfaces/http_paging_response.interface';

import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { UserPermissionService } from '../../permission/services/user-permission/user-permission.service';

@Controller('users')
export class UserController {
  constructor(
    private _logger: LogService,
    private readonly _configurationService: ConfigurationService,
    private readonly _dataSource: DataSource,
    private readonly _permissionService: PermissionService,
    private readonly _userPermissionService: UserPermissionService,
    private readonly _userService: UserService,
  ) {}

  /**
   * @method GET
   * @url api/users/:id
   * @param id
   * @return HttpResponse<UserResponse> | HttpException
   * @description
   * @page
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getUserById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<HttpResponse<UserResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(
        req.method + ' - ' + req.url + ': ' + JSON.stringify({ id: id }),
      );

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify({ id: id }),
      );

      //#region Validation
      const valid = validateUserId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      const user = await this._userService.getUserById(id);
      if (user) {
        return await generateSuccessResponse(
          user,
          this._userPermissionService,
          null,
          req,
        );
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          id,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.USER_NOT_FOUND_ERROR, id),
        );
        //#endregion
      }
    } catch (err) {
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

  /**
   * @method POST
   * @url api/users/all
   * @access private
   * @param pages
   * @param page
   * @param input?
   * @description Hiện thị danh sách người dùng
   * @return HttpPagingResponse<UserResponse> | HttpException
   * @page roles page
   */
  @HttpCode(HttpStatus.OK)
  @Post('all')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getUsers(
    @Body() params: GetUsersDto,
    @Req() req: Request,
  ): Promise<HttpPagingResponse<UserResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + '');

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      //#region Get parrams
      const { input, page } = params;
      let { pages } = params;

      const itemsPerPage = parseInt(
        this._configurationService.get(Configuration.ITEMS_PER_PAGE),
      );
      //#endregion

      //#region Get pages
      if (pages === 0) {
        const count = await this._userService.count(input);

        if (count > 0) pages = Math.ceil(count / itemsPerPage);
      }
      //#endregion

      //#region Get users
      const users = await this._userService.getUsersPaging(
        (page - 1) * itemsPerPage,
        itemsPerPage,
        input,
      );
      //#endregion

      if (users && users.length > 0) {
        //#region Generate response
        return await generateArraySuccessResponse(pages, page, users, req);
        //#endregion
      } else {
        //#region throw HandlerException
        throw new HandlerException(
          DATABASE_EXIT_CODE.NO_CONTENT,
          req.method,
          req.url,
          ErrorMessage.NO_CONTENT,
          HttpStatus.NOT_FOUND,
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

  /**
   * @method PUT
   * @url api/users/:id
   * @access private
   * @param id
   * @description
   * @return HttpResponse<UserResponse> | HttpException
   * @page roles page
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateUser(
    @Param('id') id: string,
    @Body() params: UpdateUserDto,
    @Req() req: Request,
  ): Promise<HttpResponse<UserResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const user = await UpdateAccount(
        id,
        params,
        this._configurationService,
        this._permissionService,
        this._userService,
        this._userPermissionService,
        this._dataSource,
        req,
      );
      if (user instanceof HttpException) throw user;
      else return user;
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

  /**
   * @method PUT
   * @url api/users/active/:id
   * @access private
   * @param id
   * @description
   * @return HttpResponse<UserResponse> | HttpException
   * @page roles page
   */
  @Put('active/:id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async active(@Param('id') id: string, @Req() req: Request) {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url);

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      const user = await this._userService.getUserById(id);
      if (user) {
        const result = await this._userService.active(user);
        if (result) {
          return returnObjects({ id: user.id });
        }
        throw generateFailedResponse(req, ErrorMessage.OPERATOR_USER_ERROR);
      } else {
        //#region throw HandlerException
        return new HandlerException(
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.USER_NOT_FOUND_ERROR, id),
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

  /**
   * @method DELETE
   * @url api/users/:id
   * @access private
   * @param id
   * @description
   * @return HttpPagingResponse<UserResponse> | HttpException
   * @page user page
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async unlink(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<HttpResponse<UserResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + '');

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      const user = await this._userService.getUserById(id);

      if (user) {
        const result = await this._userService.unlink(id);

        if (result) {
          return generateSuccessResponse(
            user,
            this._userPermissionService,
            null,
            req,
          );
        }
        throw generateFailedResponse(req);
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
