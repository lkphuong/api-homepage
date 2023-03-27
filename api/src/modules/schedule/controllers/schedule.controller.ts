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

import {
  generateArraySuccessResponse,
  generateSuccessResponse,
} from '../utils';
import { sprintf } from '../../../utils';

import { validateScheduleId, validateLanguageId } from '../validations';

import { createSchedule, updateSchedule, deleteschedule } from '../funcs';

import { GetSchedulePagingDto } from '../dtos/get_schedule_paging.dto';
import { CreateScheduleDto } from '../dtos/create_schedule.dto';
import { UpdateScheduleDto } from '../dtos/update_schedule.dto';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { LogService } from '../../log/services/log.service';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { ScheduleService } from '../services/schedule/schedule.service';
import { ScheduleLanguageService } from '../services/schedule-language/schedule_language.service';

import {
  DeleteScheduleLanguageResponse,
  ScheduleLanguageResponse,
  SchedulePagingResponse,
} from '../interfaces/schedule_response.interface';
import { HttpPagingResponse } from '../../../interfaces/http_paging_response.interface';
import { HttpResponse } from '../../../interfaces/http_response.interface';

import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

@Controller('schedules')
export class ScheduleController {
  constructor(
    private _logger: LogService,
    private readonly _dataSource: DataSource,
    private readonly _scheduleService: ScheduleService,
    private readonly _scheduleLanguageService: ScheduleLanguageService,
    private readonly _configurationService: ConfigurationService,
  ) {}

  /**
   * @method GET
   * @url api/schedules/:id/?language_id=
   * @param id
   * @return HttpResponse<ScheduleLanguageResponse> | HttpException
   * @description
   * @page
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getBannerById(
    @Param('id') id: string,
    @Query('language_id') language_id: string,
    @Req() req: Request,
  ): Promise<HttpResponse<ScheduleLanguageResponse> | HttpException> {
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
      let valid = validateScheduleId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      //#region Validate language id
      valid = validateLanguageId(language_id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion
      //#endregion

      const schedule_language =
        await this._scheduleLanguageService.getScheduleLanguageById(
          id,
          language_id,
        );

      if (schedule_language) {
        //#region generate response
        return await generateSuccessResponse(schedule_language, null, req);
        //#endregion
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          id,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.SCHEDULE_NOT_FOUND_ERROR, id),
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
   * @url api/schedules/:id
   * @param id
   * @return HttpResponse<ScheduleLanguageResponse> | HttpException
   * @description
   * @page
   */
  @Post('all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getBannerPaging(
    @Body() params: GetSchedulePagingDto,
    @Req() req: Request,
  ): Promise<HttpPagingResponse<SchedulePagingResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + '');

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      //#region Get parrams
      const { language_id, page, input } = params;
      let { pages } = params;

      const itemsPerPage = parseInt(
        this._configurationService.get(Configuration.ITEMS_PER_PAGE),
      );
      //#endregion

      //#region Get pages
      if (pages === 0) {
        const count = await this._scheduleService.count(language_id, input);

        if (count > 0) pages = Math.ceil(count / itemsPerPage);
      }
      //#endregion

      //#region get schedules
      const schedules = await this._scheduleService.getSchedulePaging(
        (page - 1) * itemsPerPage,
        itemsPerPage,
        language_id,
        input,
      );
      //#endregion
      if (schedules && schedules.length > 0) {
        //#region generate response
        return await generateArraySuccessResponse(pages, page, schedules, req);
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
   * @url api/schedules/
   * @param id
   * @return HttpResponse<ScheduleLanguageResponse> | HttpException
   * @description
   * @page
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() params: CreateScheduleDto,
    @Req() req: Request,
  ): Promise<HttpResponse<ScheduleLanguageResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const banner = await createSchedule(
        params,
        this._scheduleService,
        this._scheduleLanguageService,
        this._dataSource,
        req,
      );
      if (banner instanceof HttpException) throw banner;
      else return banner;
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
   * @url api/schedules/:id
   * @param id
   * @return HttpResponse<ScheduleLanguageResponse> | HttpException
   * @description
   * @page
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string,
    @Body() params: UpdateScheduleDto,
    @Req() req: Request,
  ): Promise<HttpResponse<ScheduleLanguageResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const banner = await updateSchedule(
        id,
        params,
        this._scheduleService,
        this._scheduleLanguageService,
        this._dataSource,
        req,
      );
      if (banner instanceof HttpException) throw banner;
      else return banner;
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
   * @url api/schedules/:id
   * @param id
   * @return HttpResponse<ScheduleLanguageResponse> | HttpException
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
  ): Promise<HttpResponse<DeleteScheduleLanguageResponse> | HttpException> {
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
      const result = await deleteschedule(
        id,
        this._scheduleService,
        this._scheduleLanguageService,
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
