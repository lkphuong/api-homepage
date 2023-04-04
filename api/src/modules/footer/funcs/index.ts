import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, QueryRunner } from 'typeorm';
import { FooterDto } from '../dtos/footer.dto';
import { FooterService } from '../services/footer.service';
import { ContentService } from '../../content/services/content.service';
import { UniqueException } from '../../../exceptions/UniqueException';
import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import { FooterLanguageEntity } from '../../../entities/footer_language.entity';
import { LANGUAGE_DEFAULT } from '../../../constants';
import { ContentEntity } from '../../../entities/content.entity';
import { generateFailedResponse, generateSuccessResponse } from '../utils';
import { HandlerException } from '../../../exceptions/HandlerException';

export const createFooter = async (
  language_id: string,
  params: FooterDto,
  footer_service: FooterService,
  content_service: ContentService,
  data_source: DataSource,
  req: Request,
) => {
  //#region get params
  const { content } = params;
  //#endregion

  //#region validation
  const valid = await footer_service.contains(language_id);
  if (valid) {
    throw new UniqueException(
      language_id,
      DATABASE_EXIT_CODE.UNIQUE_FIELD_VALUE,
      req.method,
      req.path,
      ErrorMessage.FOOTER_HAS_EXIST_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region create footer
    let footer = new FooterLanguageEntity();
    footer.language_id = language_id ?? LANGUAGE_DEFAULT;

    footer = await footer_service.add(footer, query_runner.manager);

    if (footer) {
      //#region create content
      let _content = new ContentEntity();
      _content.content = content;
      _content.source_id = footer.id;

      _content = await content_service.add(_content, query_runner.manager);
      //#endregion

      if (_content) {
        footer.content = _content;

        //#region transform response
        return await generateSuccessResponse(footer, query_runner, req);
        //#endregion
      }
    }

    throw generateFailedResponse(req);

    //#endregion
  } catch (err) {
    // Rollback transaction
    await query_runner.rollbackTransaction();

    console.log('--------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + err.message);

    if (err instanceof HttpException) return err;
    else {
      //#region throw HandlerException
      return new HandlerException(
        SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
        req.method,
        req.url,
      );
      //#endregion
    }
  } finally {
    // Release transaction
    await query_runner.release();
  }
};

export const updateFooter = async (
  language_id: string,
  params: FooterDto,
  footer_service: FooterService,
  content_service: ContentService,
  data_source: DataSource,
  req: Request,
) => {
  //#region get params
  const { content } = params;
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    const footer = await footer_service.contains(language_id);
    if (footer) {
      let _content = await content_service.getContentBySourceId(footer.id);
      if (_content) {
        //#region Update footer
        _content.content = content;
        _content.source_id = footer.id;

        _content = await content_service.add(_content, query_runner.manager);

        if (_content) {
          footer.content = _content;

          //#region transform response
          return await generateSuccessResponse(footer, query_runner, req);
          //#endregion
        }
      } else {
        //#region create footer
        let new_content = new ContentEntity();
        new_content.content = content;
        new_content.source_id = footer.id;

        new_content = await content_service.add(
          new_content,
          query_runner.manager,
        );

        if (_content) {
          footer.content = new_content;

          //#region transform response
          return await generateSuccessResponse(footer, query_runner, req);
          //#endregion
        }
      }

      throw generateFailedResponse(req);
      //#endregion
    } else {
      //#region create footer
      let footer = new FooterLanguageEntity();
      footer.language_id = language_id ?? LANGUAGE_DEFAULT;

      footer = await footer_service.add(footer, query_runner.manager);

      if (footer) {
        //#region create content
        let _content = new ContentEntity();
        _content.content = content;
        _content.source_id = footer.id;

        _content = await content_service.add(_content, query_runner.manager);
        //#endregion

        if (_content) {
          footer.content = _content;

          //#region transform response
          return await generateSuccessResponse(footer, query_runner, req);
          //#endregion
        }
      }

      throw generateFailedResponse(req);

      //#endregion
    }
  } catch (err) {
    // Rollback transaction
    await query_runner.rollbackTransaction();

    console.log('--------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + err.message);

    if (err instanceof HttpException) return err;
    else {
      //#region throw HandlerException
      return new HandlerException(
        SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
        req.method,
        req.url,
      );
      //#endregion
    }
  } finally {
    // Release transaction
    await query_runner.release();
  }
};
