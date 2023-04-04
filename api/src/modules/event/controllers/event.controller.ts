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

import {
  generateArraySuccessResponse,
  generateFailedResponse,
  generateSuccessResponse,
} from '../utils';
import { returnObjects, sprintf } from '../../../utils';

import { validateEventId, validateLanguageId } from '../validations';

import { createEvent, updateEvent, deleteEvent } from '../funcs';

import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { EventService } from '../services/event/event.service';
import { EventLanguageService } from '../services/event_language/event_language.service';

import { CreateEventDto } from '../dtos/create_event.dto';
import { GetEventPagingDto } from '../dtos/get_event_paging.dto';
import { UpdateEventDto } from '../dtos/update_event.dto';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { Cookies } from '../../../decorators';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { FilesService } from '../../file/services/files.service';
import { LogService } from '../../log/services/log.service';

import {
  DeleteEventResponse,
  EventResponse,
} from '../interfaces/event_response.interface';
import { HttpPagingResponse } from '../../../interfaces/http_paging_response.interface';
import { HttpResponse } from '../../../interfaces/http_response.interface';

import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

@Controller('events')
export class EventController {
  constructor(
    private _logger: LogService,
    private readonly _dataSource: DataSource,
    private readonly _eventService: EventService,
    private readonly _eventLanguageService: EventLanguageService,
    private readonly _configurationService: ConfigurationService,
    private readonly _fileService: FilesService,
  ) {}

  /**
   * @method GET
   * @url api/events/:id/?language_id=
   * @param id
   * @return HttpResponse<EventResponse> | HttpException
   * @description
   * @page
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async geteventById(
    @Param('id') id: string,
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpResponse<EventResponse> | HttpException> {
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
      //#region Validate event id
      let valid = validateEventId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      //#region Validate language id
      valid = validateLanguageId(language, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion
      //#endregion

      const event_language =
        await this._eventLanguageService.getEventLanguageById(id, language);

      if (event_language) {
        //#region generate response
        return await generateSuccessResponse(event_language, null, req);
        //#endregion
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          id,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.EVENT_NOT_FOUND_ERROR, id),
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
   * @url api/events/:id
   * @param id
   * @return HttpResponse<EventResponse> | HttpException
   * @description
   * @page
   */
  @Post('all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async geteventPaging(
    @Body() params: GetEventPagingDto,
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpPagingResponse<EventResponse> | HttpException> {
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
        const count = await this._eventService.count(language, input);

        if (count > 0) pages = Math.ceil(count / itemsPerPage);
      }
      //#endregion

      //#region get events
      const events = await this._eventService.getEventPaging(
        (page - 1) * itemsPerPage,
        itemsPerPage,
        language,
        input,
      );
      //#endregion
      if (events && events.length > 0) {
        //#region generate response
        return await generateArraySuccessResponse(pages, page, events, req);
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
   * @url api/events/
   * @param id
   * @return HttpResponse<EventResponse> | HttpException
   * @description
   * @page
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() params: CreateEventDto,
    @Req() req: Request,
  ): Promise<HttpResponse<EventResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const event = await createEvent(
        params,
        this._eventService,
        this._eventLanguageService,
        this._fileService,
        this._dataSource,
        req,
      );
      if (event instanceof HttpException) throw event;
      else return event;
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
   * @url api/events/:id
   * @param id
   * @return HttpResponse<EventResponse> | HttpException
   * @description
   * @page
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string,
    @Body() params: UpdateEventDto,
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpResponse<EventResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const event = await updateEvent(
        id,
        language,
        params,
        this._eventService,
        this._eventLanguageService,
        this._fileService,
        this._dataSource,
        req,
      );
      if (event instanceof HttpException) throw event;
      else return event;
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
   * @url api/events/active/:id
   * @access private
   * @param id
   * @description
   * @return HttpResponse<id> | HttpException
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

      const event = await this._eventService.getEventById(id);
      if (event) {
        const result = await this._eventService.active(event);
        if (result) {
          return returnObjects({ id: event.id });
        }
        throw generateFailedResponse(req, ErrorMessage.OPERATOR_EVENT_ERROR);
      } else {
        //#region throw HandlerException
        return new HandlerException(
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.EVENT_NOT_FOUND_ERROR, id),
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
   * @url api/events/:id
   * @param id
   * @return HttpResponse<EventResponse> | HttpException
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
  ): Promise<HttpResponse<DeleteEventResponse> | HttpException> {
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

      //#region delete event
      const result = await deleteEvent(
        id,
        this._eventService,
        this._eventLanguageService,
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
