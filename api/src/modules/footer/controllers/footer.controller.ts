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

import { generateSuccessResponse } from '../utils';
import { sprintf } from '../../../utils';

import { createFooter, updateFooter } from '../funcs';

import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { FooterService } from '../services/footer.service';
import { ContentService } from '../../content/services/content.service';

import { FooterDto } from '../dtos/footer.dto';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { Cookies } from '../../../decorators';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { FilesService } from '../../file/services/files.service';
import { LogService } from '../../log/services/log.service';

import { FooterResponse } from '../interfaces/footer_response.interface';
import { HttpPagingResponse } from '../../../interfaces/http_paging_response.interface';
import { HttpResponse } from '../../../interfaces/http_response.interface';

import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

@Controller('footers')
export class FooterController {
  constructor(
    private _logger: LogService,
    private readonly _dataSource: DataSource,
    private readonly _footerService: FooterService,
    private readonly _contentService: ContentService,
  ) {}

  /**
   * @method GET
   * @url api/footers/
   * @return HttpResponse<FooterResponse> | HttpException
   * @description
   * @page
   */
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Get()
  async getFooter(
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpResponse<FooterResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url);

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      const footer = await this._footerService.getFooter(language);
      if (footer) {
        return await generateSuccessResponse(footer, null, req);
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          language,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.NO_CONTENT, language),
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
   * @url api/footers/
   * @params langauge_id
   * @params content
   * @return HttpResponse<FooterResponse> | HttpException
   * @description
   * @page
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() params: FooterDto,
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpResponse<FooterResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const footer = await createFooter(
        language,
        params,
        this._footerService,
        this._contentService,
        this._dataSource,
        req,
      );
      if (footer instanceof HttpException) throw footer;
      else return footer;
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
   * @url api/footers/
   * @params langauge_id
   * @params content
   * @return
   * @description
   * @page
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() params: FooterDto,
    @Cookies() language: string,
    @Req() req: Request,
  ): Promise<HttpResponse<FooterResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const footer = await updateFooter(
        language,
        params,
        this._footerService,
        this._contentService,
        this._dataSource,
        req,
      );
      if (footer instanceof HttpException) throw footer;
      else return footer;
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
