import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Request } from 'express';

import { generateFailedResponse, generateResponse } from '../utils';

import { validateLinks } from '../validations';

import { LogService } from '../../log/services/log.service';
import { LinkService } from '../services/link.service';

import { LinkLanguageEntity } from '../../../entities/link_language.entity';

import { HandlerException } from '../../../exceptions/HandlerException';

import { ILinksResponse } from '../interfaces/link_response.interface';
import { HttpResponse } from '../../../interfaces/http_response.interface';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { LinksDto } from '../dtos/update_link.dto';

import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';

@Controller('links')
export class LinkController {
  constructor(
    private _logger: LogService,
    private readonly _linkService: LinkService,
    private readonly _dataSource: DataSource,
  ) {}

  /**
   * @method GET
   * @url api/links/
   * @return HttpResponse<ILinksResponse> | HttpException
   * @description Lấy toàn bộ danh sách liên kết
   * @page links
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getAll(
    @Req() req: Request,
  ): Promise<HttpResponse<ILinksResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url);

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      const links = await this._linkService.getLinks();

      if (links) {
        return await generateResponse(links, null, req);
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
   * @url api/links
   * @return HttpResponse<ILinksResponse> | HttpException
   * @description Update toàn bộ danh sách liên kết
   * @page links
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async bulkUpdate(
    @Body() params: LinksDto,
    @Req() req: Request,
  ): Promise<HttpResponse<ILinksResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(
        req.method + ' - ' + req.url + ' - ' + JSON.stringify({ params }),
      );

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify({ params }),
      );

      //#region validation
      const links = await validateLinks(params, this._linkService, req);
      //#endregion
      if (links instanceof HttpException) throw links;
      else {
        const { links: _links } = params;

        //#region Update links
        if (_links?.length) {
          let update_links = links.map((e) => {
            const link = _links.find((_e) => _e.id === e.id);
            return <LinkLanguageEntity>{
              ...e,
              url: link.url,
            };
          });

          update_links = await this._linkService.update(update_links);

          if (update_links?.length) {
            return await generateResponse(update_links, null, req);
          }
        }
        //#endregion
        return generateFailedResponse(req);
      }
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
