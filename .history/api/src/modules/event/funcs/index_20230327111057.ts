import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, QueryRunner } from 'typeorm';

import {
  generateDeleteSuccessResponse,
  generateFailedResponse,
  generateSuccessResponse,
} from '../utils';
import { _slugify } from '../../../utils';

import {
  validateEvent,
  validateEventId,
  validateFile,
  validateTime,
} from '../validations';

import { FileEntity } from '../../../entities/file.entity';
import { EventLanguageEntity } from '../../../entities/event_language.entity';
import { EventEntity } from '../../../entities/event.entity';

import { CreateEventDto } from '../dtos/create_event.dto';
import { UpdateEventDto } from '../dtos/update_event.dto';

import { FilesService } from '../../file/services/files.service';
import { EventService } from '../services/event/event.service';
import { EventLanguageService } from '../services/event_language/event_language.service';

import { HandlerException } from '../../../exceptions/HandlerException';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';

export const createEvent = async (
  params: CreateEventDto,
  event_service: EventService,
  event_language_service: EventLanguageService,
  file_service: FilesService,
  data_source: DataSource,
  req: Request,
) => {
  const { file_id } = params;
  //#region validate file
  const file = await validateFile(file_id, file_service, req);
  if (file instanceof HttpException) throw file;
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region Create event
    //#region Create event
    const event = await addEvent(params, event_service, query_runner);
    if (event) {
      //#region create event language
      const event_language = await addEventLanguage(
        params,
        event,
        file,
        event_language_service,
        file_service,
        query_runner,
      );
      if (event_language) {
        //#region generate response
        return await generateSuccessResponse(event_language, query_runner, req);
        //#endregion
      }
      //#endregion
    }
    //#endregion

    throw generateFailedResponse(req);
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

export const updateEvent = async (
  event_id: string,
  params: UpdateEventDto,
  event_service: EventService,
  event_language_service: EventLanguageService,
  file_service: FilesService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Get params
  const { start_date, end_date, file_id } = params;
  //#endregion

  //#region Validation
  //#region Validate time
  const valid = validateTime(start_date, end_date, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion
  //#region Validate event
  const event = await validateEvent(event_id, event_service, req);
  if (event instanceof HttpException) throw event;
  //#endregion
  //#region Validate file
  const file = await validateFile(file_id, file_service, req);
  if (file instanceof HttpException) throw file;
  //#endregion
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region update event
    const event = await editEvent(
      event_id,
      params,
      event_service,
      query_runner,
    );

    if (event) {
      //#region Update event language
      const event_language = await editEventLanguage(
        event_id,
        event,
        file,
        params,
        event_language_service,
        file_service,
        query_runner,
      );

      if (event_language) {
        //#region generate response
        return await generateSuccessResponse(event_language, query_runner, req);
        //#endregion
      }
      //#endregion
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

export const deleteEvent = async (
  event_id: string,
  event_service: EventService,
  event_language_service: EventLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Validation
  //#region validate event id
  const valid = validateEventId(event_id, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  //#region validate event
  const event = await validateEvent(event_id, event_service, req);
  if (event instanceof HttpException) throw event;
  //#endregion

  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();
    //#endregion

    //#region delete event
    const delete_event = await event_service.unlink(
      event_id,
      query_runner.manager,
    );
    if (delete_event) {
      const delete_event_language = await event_language_service.bulkUnlink(
        event_id,
        query_runner.manager,
      );

      if (delete_event_language) {
        //#region generate response
        return await generateDeleteSuccessResponse(event, query_runner, req);
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

export const addEvent = async (
  params: CreateEventDto,
  event_service: EventService,
  query_runner: QueryRunner,
) => {
  const { start_date, end_date, published } = params;

  let event = new EventEntity();
  event.start_date = new Date(start_date);
  event.end_date = new Date(end_date);
  event.published = published;

  event = await event_service.add(event, query_runner.manager);

  return event;
};

export const addEventLanguage = async (
  params: CreateEventDto,
  event: EventEntity,
  file: FileEntity,
  event_language_service: EventLanguageService,
  file_service: FilesService,
  query_runner: QueryRunner,
) => {
  const { title, language_id } = params;

  let event_language = new EventLanguageEntity();
  event_language.event = event;
  event_language.title = title;
  event_language.slug = _slugify(title );
  event_language.file_id = file.id;
  event_language.language_id = language_id;

  //#region update file
  file.drafted = false;
  file.updated_at = new Date();
  file.updated_by = 'system';
  file = await file_service.update(file, query_runner.manager);
  //#endregion

  event_language = await event_language_service.add(
    event_language,
    query_runner.manager,
  );

  return event_language;
};

export const editEvent = async (
  event_id: string,
  params: UpdateEventDto,
  event_service: EventService,
  query_runner: QueryRunner,
) => {
  const { start_date, end_date, published } = params;
  let event = await event_service.getEventById(event_id);

  event.start_date = new Date(start_date);
  event.end_date = new Date(end_date);
  event.published = published;

  event = await event_service.update(event, query_runner.manager);

  return event;
};

export const editEventLanguage = async (
  event_id: string,
  event: EventEntity,
  file: FileEntity,
  params: UpdateEventDto,
  event_language_service: EventLanguageService,
  file_service: FilesService,
  query_runner: QueryRunner,
) => {
  const { language_id, title, deleted } = params;
  let update_files: FileEntity[] = [];

  let event_language = await event_language_service.contains(
    event_id,
    language_id,
  );
  if (event_language) {
    //#region edit or delete
    if (deleted) {
      //#region delete
      event_language.deleted = true;
      event_language.deleted_at = new Date();
      event_language.deleted_by = 'system';
      //#endregion

      //#region delete file
      file.drafted = true;
      file.deleted = true;
      file.deleted_at = new Date();
      file.deleted_by = 'system';
      //#endregion
    } else {
      //#region edit
      event_language.title = title;
      event_language.slug = _slugify(title );
      event_language.file_id = file.id;
      event_language.updated_at = new Date();
      event_language.updated_by = 'system';
      //#endregion

      //#region update file
      if (file.id != event_language.file_id) {
        //#region delete old file
        const old_file = event_language.file;
        old_file.drafted = true;
        old_file.deleted = true;
        old_file.deleted_at = new Date();
        old_file.deleted_by = 'system';
        //#endregion

        //#region update new file
        file.drafted = false;
        file.updated_at = new Date();
        file.updated_by = 'system';
        //#endregion

        update_files.push(old_file, file);
      }
      //#endregion
    }
    update_files = await file_service.bulkUpdate(
      update_files,
      query_runner.manager,
    );

    event_language = await event_language_service.update(
      event_language,
      query_runner.manager,
    );

    return event_language;
    //#endregion
  } else {
    //#region add event language
    let new_event_language = new EventLanguageEntity();
    new_event_language.title = title;
    new_event_language.slug = _slugify(title );
    new_event_language.event = event;
    new_event_language.file_id = file.id;
    new_event_language.language_id = language_id;

    new_event_language = await event_language_service.add(
      new_event_language,
      query_runner.manager,
    );

    //#region update new file
    file.drafted = false;
    file.updated_at = new Date();
    file.updated_by = 'system';
    //#endregion

    await file_service.update(file, query_runner.manager);

    return new_event_language;
    //#endregion
  }
};
