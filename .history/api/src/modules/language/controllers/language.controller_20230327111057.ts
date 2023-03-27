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
  generateDeleteSuccessResponse,
  generateFailedResponse,
  generateResponse,
  generateSuccessResponse,
} from '../utils';
import { sprintf, _slugify } from '../../../utils';

import { LanguageEntity } from '../../../entities/language.entity';

import {
  validateLanguageId,
  validateLanguage,
  validateSlugLanguage,
} from '../validations';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { LogService } from '../../log/services/log.service';
import { LanguageService } from '../services/language.service';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';

import { LanguageDto } from '../dtos/language.dto';
import { GetLanguagePagingDto } from '../dtos/get_language_paging.dto';

import { HttpPagingResponse } from '../../../interfaces/http_paging_response.interface';
import { HttpResponse } from '../../../interfaces/http_response.interface';
import {
  DeleteLanguageResponse,
  LanguageResponse,
} from '../interfaces/language_response';

import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

@Controller('languages')
export class LanguageController {
  constructor(
    private _logger: LogService,
    private readonly _dataSource: DataSource,
    private readonly _languageService: LanguageService,
    private readonly _configurationService: ConfigurationService,
  ) {}

  /**
   * @method GET
   * @url api/languages/
   * @param id
   * @return HttpResponse<LanguageResponse[]> | HttpException
   * @description
   * @page
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getAll(
    @Req() req: Request,
  ): Promise<HttpResponse<LanguageResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url);

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      const languages = await this._languageService.getAll();

      if (languages) {
        //#region generate response
        return await generateResponse(languages, null, req);
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
   * @method GET
   * @url api/languages/:id/
   * @param id
   * @return HttpResponse<LanguageResponse> | HttpException
   * @description
   * @page
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getlanguageById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<HttpResponse<LanguageResponse> | HttpException> {
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
      //#region Validate language id
      const valid = validateLanguageId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      //#endregion

      const language = await this._languageService.getLanguageById(id);

      if (language) {
        //#region generate response
        return await generateSuccessResponse(language, null, req);
        //#endregion
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          id,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.LANGUAGE_NOT_FOUND_ERROR, id),
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
   * @url api/language/all
   * @param
   * @return HttpPagingResponse<LanguageResponse> | HttpException
   * @description
   * @page
   */
  @Post('all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getlanguagePaging(
    @Body() params: GetLanguagePagingDto,
    @Req() req: Request,
  ): Promise<HttpPagingResponse<LanguageResponse> | HttpException> {
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
        const count = await this._languageService.count(input);

        if (count > 0) pages = Math.ceil(count / itemsPerPage);
      }
      //#endregion

      //#region get languages
      const languages = await this._languageService.getLanguagePaging(
        (page - 1) * itemsPerPage,
        itemsPerPage,
        input,
      );
      //#endregion
      if (languages && languages.length > 0) {
        //#region generate response
        return await generateArraySuccessResponse(pages, page, languages, req);
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
   * @url api/languages/
   * @param id
   * @return HttpResponse<LanguageResponse> | HttpException
   * @description
   * @page
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() params: LanguageDto,
    @Req() req: Request,
  ): Promise<HttpResponse<LanguageResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      //#region Get param
      const { name, published } = params;

      //#region Validate slug
      const valid = await validateSlugLanguage(
        name,
        this._languageService,
        req,
      );
      if (valid instanceof HttpException) throw valid;
      //#endregion
      //#endregion

      //#region generate code
      const count = await this._languageService.count();
      //#endregion

      //#region create language
      let language = new LanguageEntity();
      language.name = name;
      language.code = (parseInt(count.toString()) + 1).toString();
      language.slug = _slugify(name );
      language.published = published;

      language = await this._languageService.add(language);

      if (language) {
        return await generateSuccessResponse(language, null, req);
      } else {
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

  /**
   * @method PUT
   * @url api/languages/:id
   * @param id
   * @return HttpResponse<LanguageResponse> | HttpException
   * @description
   * @page
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string,
    @Body() params: LanguageDto,
    @Req() req: Request,
  ): Promise<HttpResponse<LanguageResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );
      //#region get param
      const { name, published } = params;

      //#region validate id
      const valid = validateLanguageId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion
      const language = await this._languageService.contains(id, name);
      if (language) {
        throw new HandlerException(
          DATABASE_EXIT_CODE.UNIQUE_FIELD_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.LANGUAGE_HAS_EXIST_ERROR, name),
          HttpStatus.BAD_REQUEST,
        );
      }

      let update_language = await validateLanguage(
        id,
        this._languageService,
        req,
      );
      if (update_language instanceof HttpException) throw update_language;

      //#region update language
      update_language.name = name;
      update_language.slug = _slugify(name );
      update_language.published = published;
      update_language.updated_at = new Date();
      update_language.updated_by = 'system';

      update_language = await this._languageService.update(update_language);

      if (update_language) {
        return await generateSuccessResponse(update_language, null, req);
      } else {
        return generateFailedResponse(req);
      }
      //#endregion
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

  /**
   * @method DELETE
   * @url api/language/:id
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
  ): Promise<HttpResponse<DeleteLanguageResponse> | HttpException> {
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

      //#region validate language id
      const valid = validateLanguageId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      //#region delete language

      const language = await validateLanguage(id, this._languageService, req);
      if (language instanceof HttpException) throw language;

      language.deleted = true;
      language.deleted_at = new Date();
      language.deleted_by = 'system';

      if (language) {
        return await generateDeleteSuccessResponse(language, null, req);
      } else {
        return await generateFailedResponse(req);
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
