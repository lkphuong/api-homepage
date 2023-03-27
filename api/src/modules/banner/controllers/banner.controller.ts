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

import { validateBannerId, validateLanguageId } from '../validations';

import { createBanner, deleteBanner, updateBanner } from '../funcs';

import { CreateBannerDto } from '../dtos/create_banner.dto';
import { GetBannerPagingDto } from '../dtos/get_banner_paging.dto';
import { UpdateBannerDto } from '../dtos/update_banner.dto';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { FilesService } from '../../file/services/files.service';
import { LogService } from '../../log/services/log.service';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { BannerLanguageService } from '../services/banner-language/banner_language.service';
import { BannerService } from '../services/banner/banner.service';

import {
  BannerResponse,
  DeleteBannerResponse,
} from '../interfaces/banner_response.interface';
import { HttpPagingResponse } from '../../../interfaces/http_paging_response.interface';
import { HttpResponse } from '../../../interfaces/http_response.interface';

import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

@Controller('banners')
export class BannerController {
  constructor(
    private _logger: LogService,
    private readonly _dataSource: DataSource,
    private readonly _bannerService: BannerService,
    private readonly _bannerLanguageService: BannerLanguageService,
    private readonly _configurationService: ConfigurationService,
    private readonly _fileService: FilesService,
  ) {}

  /**
   * @method GET
   * @url api/banners/:id/?language_id=
   * @param id
   * @return HttpResponse<BannerResponse> | HttpException
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
  ): Promise<HttpResponse<BannerResponse> | HttpException> {
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
      let valid = validateBannerId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      //#region Validate language id
      valid = validateLanguageId(language_id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion
      //#endregion

      const banner_language =
        await this._bannerLanguageService.getBannerLanguageById(
          id,
          language_id,
        );

      if (banner_language) {
        //#region generate response
        return await generateSuccessResponse(banner_language, null, req);
        //#endregion
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          id,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.BANNER_NOT_FOUND_ERROR, id),
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
  async getBannerPaging(
    @Body() params: GetBannerPagingDto,
    @Req() req: Request,
  ): Promise<HttpPagingResponse<BannerResponse> | HttpException> {
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
        const count = await this._bannerService.count(language_id, input);
        console.log('count: ', count);
        if (count > 0) pages = Math.ceil(count / itemsPerPage);
      }
      //#endregion

      //#region get banners
      const banners = await this._bannerService.getBannerPaging(
        (page - 1) * itemsPerPage,
        itemsPerPage,
        language_id,
        input,
      );
      //#endregion
      if (banners && banners.length > 0) {
        //#region generate response
        return await generateArraySuccessResponse(pages, page, banners, req);
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
   * @url api/banners/
   * @param id
   * @return HttpResponse<BannerResponse> | HttpException
   * @description
   * @page
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() params: CreateBannerDto,
    @Req() req: Request,
  ): Promise<HttpResponse<BannerResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const banner = await createBanner(
        params,
        this._bannerService,
        this._bannerLanguageService,
        this._fileService,
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
   * @url api/banners/:id
   * @param id
   * @return HttpResponse<BannerResponse> | HttpException
   * @description
   * @page
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string,
    @Body() params: UpdateBannerDto,
    @Req() req: Request,
  ): Promise<HttpResponse<BannerResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const banner = await updateBanner(
        id,
        params,
        this._bannerService,
        this._bannerLanguageService,
        this._fileService,
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
   * @url api/banners/:id
   * @param id
   * @return HttpResponse<BannerResponse> | HttpException
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
      const result = await deleteBanner(
        id,
        this._bannerService,
        this._bannerLanguageService,
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
