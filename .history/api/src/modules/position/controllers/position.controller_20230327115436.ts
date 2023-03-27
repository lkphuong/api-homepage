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

import { createPosition, updatePosition, deletePosition } from '../funcs';

import { validateLanguageId, validatePositionId } from '../validations';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { LogService } from '../../log/services/log.service';
import { PositionService } from '../services/position/position.service';
import { PositionLanguageService } from '../services/position_language/position_language.service';

import { ConfigurationService } from '../../shared/services/configuration/configuration.service';

import { CreatePositionDto } from '../dtos/create_position.dto';
import { UpdatePositionDto } from '../dtos/update_position.dto';
import { GetPositionPagingDto } from '../dtos/get_position_paging.dto';

import { HttpPagingResponse } from '../../../interfaces/http_paging_response.interface';
import { HttpResponse } from '../../../interfaces/http_response.interface';
import {
  PositionResponse,
  DeleteNotificationResponse,
} from '../interfaces/position_response.interface';

import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import { Cookies } from '../../../decorators';

@Controller('positions')
export class PositionController {
  constructor(
    private _logger: LogService,
    private readonly _dataSource: DataSource,
    private readonly _positionService: PositionService,
    private readonly _positionLanguageService: PositionLanguageService,
    private readonly _configurationService: ConfigurationService,
  ) {}

  /**
   * @method GET
   * @url api/positions/:id/?language_id=
   * @param id
   * @return HttpResponse<PositionResponse> | HttpException
   * @description
   * @page
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getpositionById(
    @Param('id') id: string,
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpResponse<PositionResponse> | HttpException> {
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
      //#region Validate position id
      let valid = validatePositionId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      //#region Validate language id
      valid = validateLanguageId(language, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion
      //#endregion

      const position_language =
        await this._positionLanguageService.getPositionLanguageById(
          id,
          language_id,
        );

      if (position_language) {
        //#region generate response
        return await generateSuccessResponse(position_language, null, req);
        //#endregion
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          id,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.POSITION_NOT_FOUND_ERROR, id),
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
   * @url api/positions/:id
   * @param id
   * @return HttpResponse<positionResponse> | HttpException
   * @description
   * @page
   */
  @Post('all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getpositionPaging(
    @Body() params: GetPositionPagingDto,
    @Req() req: Request,
  ): Promise<HttpPagingResponse<PositionResponse> | HttpException> {
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
        const count = await this._positionService.count(language_id, input);

        if (count > 0) pages = Math.ceil(count / itemsPerPage);
      }
      //#endregion

      //#region get positions
      const positions = await this._positionService.getPositionPaging(
        (page - 1) * itemsPerPage,
        itemsPerPage,
        language_id,
        input,
      );
      //#endregion
      if (positions && positions.length > 0) {
        //#region generate response
        return await generateArraySuccessResponse(pages, page, positions, req);
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
   * @url api/positions/
   * @param id
   * @return HttpResponse<PositionResponse> | HttpException
   * @description
   * @page
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() params: CreatePositionDto,
    @Req() req: Request,
  ): Promise<HttpResponse<PositionResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const position = await createPosition(
        params,
        this._positionService,
        this._positionLanguageService,
        this._dataSource,
        req,
      );
      if (position instanceof HttpException) throw position;
      else return position;
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
   * @url api/positions/:id
   * @param id
   * @return HttpResponse<PositionResponse> | HttpException
   * @description
   * @page
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string,
    @Body() params: UpdatePositionDto,
    @Req() req: Request,
  ): Promise<HttpResponse<PositionResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const position = await updatePosition(
        id,
        params,
        this._positionService,
        this._positionLanguageService,
        this._dataSource,
        req,
      );
      if (position instanceof HttpException) throw position;
      else return position;
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
   * @url api/positions/:id
   * @param id
   * @return HttpResponse<DeleteNotificationResponse> | HttpException
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
  ): Promise<HttpResponse<DeleteNotificationResponse> | HttpException> {
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

      //#region delete position
      const result = await deletePosition(
        id,
        this._positionService,
        this._positionLanguageService,
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
