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
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSource } from 'typeorm';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';
import { LogService } from '../../log/services/log.service';
import { NotificationService } from '../services/notification/notification.service';
import { NotificationLanguageService } from '../services/notification-language/notification_language.service';
import { HttpResponse } from '../../../interfaces/http_response.interface';
import { NotificationResponse } from '../interfaces/notification_response.interface';
import { validateLanguageId, validateNotificationId } from '../validations';
import {
  generateArraySuccessResponse,
  generateSuccessResponse,
} from '../utils';
import { sprintf } from '../../../utils';
import { ErrorMessage } from '../constants/enums/errors.enum';
import { GetNotificationPagingDto } from '../dtos/get_notification_paging.dto';
import { HttpPagingResponse } from '../../../interfaces/http_paging_response.interface';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { CreateNotificationDto } from '../dtos/create_notification.dto';
import {
  createNotification,
  deleteNotification,
  updateNotification,
} from '../funcs';
import { UpdateNotificationDto } from '../dtos/update_notification.dto';
import { DeleteBannerResponse } from '../../banner/interfaces/banner_response.interface';
import { Cookies } from '../../../decorators';

@Controller('notifications')
export class NotificationController {
  constructor(
    private _logger: LogService,
    private readonly _dataSource: DataSource,
    private readonly _notificationService: NotificationService,
    private readonly _notificationLanguageService: NotificationLanguageService,
    private readonly _configurationService: ConfigurationService,
  ) {}

  /**
   * @method GET
   * @url api/notifications/:id/
   * @param id
   * @return HttpResponse<NotificationResponse> | HttpException
   * @description
   * @page
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getNotificationById(
    @Param('id') id: string,
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpResponse<NotificationResponse> | HttpException> {
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
      //#region Validate banner id
      let valid = validateNotificationId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      //#region Validate language id
      valid = validateLanguageId(language, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion
      //#endregion

      const notification_language =
        await this._notificationLanguageService.getNotiLanguageById(
          id,
          language,
        );

      if (notification_language) {
        //#region generate response
        return await generateSuccessResponse(notification_language, null, req);
        //#endregion
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          id,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.NOTIFICATION_NOT_FOUND_ERROR, id),
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
   * @method POST
   * @url api/banners/:id
   * @param id
   * @return HttpResponse<BannerResponse> | HttpException
   * @description
   * @page
   */
  @Post('all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getNotificationPaging(
    @Body() params: GetNotificationPagingDto,
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpPagingResponse<NotificationResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + '');

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      //#region Get parrams
      const { page, input } = params;
      let { pages } = params;

      const itemsPerPage = parseInt(
        this._configurationService.get(Configuration.ITEMS_PER_PAGE),
      );
      //#endregion

      //#region Get pages
      if (pages === 0) {
        const count = await this._notificationService.count(language, input);

        if (count > 0) pages = Math.ceil(count / itemsPerPage);
      }
      //#endregion

      //#region get banners
      const notifications =
        await this._notificationService.getNotificationPaging(
          (page - 1) * itemsPerPage,
          itemsPerPage,
          language,
          input,
        );
      //#endregion
      if (notifications && notifications.length > 0) {
        //#region generate response
        return await generateArraySuccessResponse(
          pages,
          page,
          notifications,
          req,
        );
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
   * @method POST
   * @url api/notifications/
   * @param id
   * @return HttpResponse<NotificationResponse> | HttpException
   * @description
   * @page
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() params: CreateNotificationDto,
    @Req() req: Request,
  ): Promise<HttpResponse<NotificationResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const notification = await createNotification(
        params,
        this._notificationService,
        this._notificationLanguageService,
        this._dataSource,
        req,
      );
      if (notification instanceof HttpException) throw notification;
      else return notification;
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
   * @url api/notifications/:id
   * @param id
   * @return HttpResponse<NotificationResponse> | HttpException
   * @description
   * @page
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string,
    @Body() params: UpdateNotificationDto,
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpResponse<NotificationResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const notification = await updateNotification(
        id,
        language,
        params,
        this._notificationService,
        this._notificationLanguageService,
        this._dataSource,
        req,
      );
      if (notification instanceof HttpException) throw notification;
      else return notification;
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
   * @url api/notifications/:id
   * @param id
   * @return HttpResponse<DeleteBannerResponse> | HttpException
   * @description
   * @page
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async unlink(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<HttpResponse<DeleteBannerResponse> | HttpException> {
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

      //#region delete banner
      const result = await deleteNotification(
        id,
        this._notificationService,
        this._notificationLanguageService,
        this._dataSource,
        req,
      );
      if (result instanceof HttpException) throw result;
      else return result;
      //#endregion
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
