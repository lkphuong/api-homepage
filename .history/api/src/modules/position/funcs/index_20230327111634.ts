import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, QueryRunner } from 'typeorm';

import {
  generateDeleteSuccessResponse,
  generateFailedResponse,
  generateSuccessResponse,
} from '../utils';
import { _slugify } from '../../../utils';

import { PositionEntity } from '../../../entities/position.entity';
import { PositionLanguageEntity } from '../../../entities/position_language.entity';

import { CreatePositionDto } from '../dtos/create_position.dto';
import { UpdatePositionDto } from '../dtos/update_position.dto';

import { PositionService } from '../services/position/position.service';
import { PositionLanguageService } from '../services/position_language/position_language.service';

import { HandlerException } from '../../../exceptions/HandlerException';

import { validatePosition, validatePositionId } from '../validations';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { LANGUAGE_DEFAULT } from '../../../constants';

export const createPosition = async (
  param: CreatePositionDto,
  position_service: PositionService,
  position_language_service: PositionLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  const { title, published } = param;

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region create position
    const position = await addPosition(
      published,
      position_service,
      query_runner,
    );
    if (position) {
      //#region create position language
      const position_language = await addPositionLanguage(
        title,
        position,
        position_language_service,
        query_runner,
      );
      if (position_language) {
        //#region generate response
        return await generateSuccessResponse(
          position_language,
          query_runner,
          req,
        );
        //#endregion
      }
      //#endregion
    }
    //#endregion
    return generateFailedResponse(req);
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

export const deletePosition = async (
  position_id: string,
  position_service: PositionService,
  position_language_service: PositionLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Validate position_id
  const valid = validatePositionId(position_id, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  //#region validate position
  const valid_noti = await validatePosition(position_id, position_service, req);
  if (valid_noti instanceof HttpException) throw valid_noti;
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();
    //#endregion

    //#region delete position
    const position = await position_service.unlink(
      position_id,
      query_runner.manager,
    );
    if (position) {
      //#region delete position language
      const position_language = await position_language_service.bulkUnlink(
        position_id,
        query_runner.manager,
      );
      if (position_language) {
        return await generateDeleteSuccessResponse(
          valid_noti,
          query_runner,
          req,
        );
      }
      //#endregion
    }
    //#endregion
    return generateFailedResponse(req);
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

export const updatePosition = async (
  position_id: string,
  params: UpdatePositionDto,
  position_service: PositionService,
  position_language_service: PositionLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Get params
  const { published } = params;
  //#endregion

  //#region Validate position id
  const valid = validatePositionId(position_id, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  //#region validate position
  const valid_noti = await validatePosition(position_id, position_service, req);
  if (valid_noti instanceof HttpException) throw valid_noti;
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();
  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region update position
    const position = await editPosition(
      position_id,
      published,
      position_service,
      query_runner,
    );
    if (position) {
      //#region update position language
      const position_language = await editPositionLanguage(
        position_id,
        position,
        params,
        position_language_service,
        query_runner,
      );

      if (position_language) {
        //#region generate response
        return await generateSuccessResponse(
          position_language,
          query_runner,
          req,
        );
        //#endregion
      }
      //#endregion
    }
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

export const addPosition = async (
  published: boolean,
  position_service: PositionService,
  query_runner: QueryRunner,
) => {
  let position = new PositionEntity();
  position.published = published;
  position.created_at = new Date();
  position.created_by = 'system';

  position = await position_service.add(position, query_runner.manager);

  return position;
};

export const addPositionLanguage = async (
  title: string,
  position: PositionEntity,
  position_language_service: PositionLanguageService,
  query_runner: QueryRunner,
) => {
  let position_language = new PositionLanguageEntity();
  position_language.position = position;
  position_language.title = title;
  position_language.slug = _slugify(title);
  position_language.language_id = LANGUAGE_DEFAULT;
  position_language.created_at = new Date();
  position_language.created_by = 'system';

  position_language = await position_language_service.add(
    position_language,
    query_runner.manager,
  );

  return position_language;
};

export const editPosition = async (
  position_id: string,
  published: boolean,
  position_service: PositionService,
  query_runner: QueryRunner,
) => {
  let position = await position_service.getPositionById(position_id);

  position.published = published;
  position.updated_at = new Date();
  position.updated_by = 'system';

  position = await position_service.update(position, query_runner.manager);

  return position;
};

export const editPositionLanguage = async (
  position_id: string,
  position: PositionEntity,
  param: UpdatePositionDto,
  position_language_service: PositionLanguageService,
  query_runner: QueryRunner,
) => {
  const { language_id, title } = param;

  let position_language = await position_language_service.contains(
    position_id,
    language_id,
  );

  if (position_language) {
    //#region edit position
    position_language.title = title;
    position_language.slug = _slugify(title);
    position_language.updated_at = new Date();
    position_language.updated_by = 'system';

    position_language = await position_language_service.update(
      position_language,
      query_runner.manager,
    );

    return position_language;
    //#endregion
  } else {
    //#region update new noti language
    let new_position_language = new PositionLanguageEntity();
    new_position_language.title = title;
    new_position_language.slug = _slugify(title);
    new_position_language.position = position;
    new_position_language.language_id = language_id;
    new_position_language.created_at = new Date();
    new_position_language.created_by = 'system';

    new_position_language = await position_language_service.add(
      new_position_language,
      query_runner.manager,
    );

    return new_position_language;
    //#endregion
  }
};
