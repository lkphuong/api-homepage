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
  validateLanguageId,
  validateSchedule,
  validateScheduleId,
} from '../validations';

import { ScheduleEntity } from '../../../entities/schedule.entity';
import { ScheduleLanguageEntity } from '../../../entities/schedule_language.entity';

import { CreateScheduleDto } from '../dtos/create_schedule.dto';
import { UpdateScheduleDto } from '../dtos/update_schedule.dto';

import { ScheduleService } from '../services/schedule/schedule.service';
import { ScheduleLanguageService } from '../services/schedule-language/schedule_language.service';

import { HandlerException } from '../../../exceptions/HandlerException';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';

export const createSchedule = async (
  params: CreateScheduleDto,
  schedule_service: ScheduleService,
  schedule_language_service: ScheduleLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region Create schedule
    const schedule = await addSchedule(params, schedule_service, query_runner);
    if (schedule) {
      //#region create schedule language
      const schedule_language = await addScheduleLanguage(
        params,
        schedule,
        schedule_language_service,
        query_runner,
      );
      if (schedule_language) {
        //#region generate response
        return await generateSuccessResponse(
          schedule_language,
          query_runner,
          req,
        );
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

export const updateSchedule = async (
  schedule_id: string,
  params: UpdateScheduleDto,
  schedule_service: ScheduleService,
  schedule_language_service: ScheduleLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Get params
  const { language_id } = params;
  //#endregion

  //#region Validation
  //#region Validate language
  const valid = await validateLanguageId(language_id, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion
  //#region Validate schedule
  const schedule = await validateSchedule(schedule_id, schedule_service, req);
  if (schedule instanceof HttpException) throw schedule;
  //#endregion
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region update schedule
    const schedule = await editSchedule(
      schedule_id,
      params,
      schedule_service,
      query_runner,
    );

    if (schedule) {
      //#region Update schedule language
      const schedule_language = await editScheduleLanguage(
        schedule_id,
        schedule,
        params,
        schedule_language_service,
        query_runner,
      );

      if (schedule_language) {
        //#region generate response
        return await generateSuccessResponse(
          schedule_language,
          query_runner,
          req,
        );
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

export const deleteschedule = async (
  schedule_id: string,
  schedule_service: ScheduleService,
  schedule_language_service: ScheduleLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Validation
  //#region validate schedule id
  const valid = validateScheduleId(schedule_id, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  //#region validate schedule
  const schedule = await validateSchedule(schedule_id, schedule_service, req);
  if (schedule instanceof HttpException) throw schedule;
  //#endregion

  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();
    //#endregion

    //#region delete schedule
    const delete_schedule = await schedule_service.unlink(
      schedule_id,
      query_runner.manager,
    );
    if (delete_schedule) {
      const delete_schedule_language =
        await schedule_language_service.bulkUnlink(
          schedule_id,
          query_runner.manager,
        );

      if (delete_schedule_language) {
        //#region generate response
        return await generateDeleteSuccessResponse(schedule, query_runner, req);
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

export const addSchedule = async (
  params: CreateScheduleDto,
  schedule_service: ScheduleService,
  query_runner: QueryRunner,
) => {
  const { timeframe, published } = params;

  let schedule = new ScheduleEntity();
  schedule.timeframe = timeframe;
  schedule.published = published;

  console.log('schedule: ', schedule);

  schedule = await schedule_service.add(schedule, query_runner.manager);

  return schedule;
};

export const addScheduleLanguage = async (
  params: CreateScheduleDto,
  schedule: ScheduleEntity,
  schedule_language_service: ScheduleLanguageService,
  query_runner: QueryRunner,
) => {
  const { title, language_id, content } = params;

  let schedule_language = new ScheduleLanguageEntity();
  schedule_language.schedule = schedule;
  schedule_language.title = title;
  schedule_language.content = content;
  schedule_language.slug = _slugify(title + '-' + Date.now());
  schedule_language._slug = _slugify(title);
  schedule_language.language_id = language_id;

  schedule_language = await schedule_language_service.add(
    schedule_language,
    query_runner.manager,
  );

  return schedule_language;
};

export const editSchedule = async (
  schedule_id: string,
  params: UpdateScheduleDto,
  schedule_service: ScheduleService,
  query_runner: QueryRunner,
) => {
  const { timeframe, published } = params;
  let schedule = await schedule_service.getScheduleById(schedule_id);

  schedule.timeframe = timeframe;
  schedule.published = published;

  schedule = await schedule_service.update(schedule, query_runner.manager);

  return schedule;
};

export const editScheduleLanguage = async (
  schedule_id: string,
  schedule: ScheduleEntity,
  params: UpdateScheduleDto,
  schedule_language_service: ScheduleLanguageService,
  query_runner: QueryRunner,
) => {
  const { title, deleted, attendee, content, location, language_id } = params;

  let schedule_language = await schedule_language_service.contains(
    schedule_id,
    language_id,
  );

  if (schedule_language) {
    //#region edit or delete
    if (deleted) {
      //#region delete
      schedule_language.deleted = true;
      schedule_language.deleted_at = new Date();
      schedule_language.deleted_by = 'system';
      //#endregion
    } else {
      //#region edit
      schedule_language.title = title;
      schedule_language.location = location;
      schedule_language.attendee = attendee;
      schedule_language.content = content;
      schedule_language.language_id = language_id;
      schedule_language.slug = _slugify(title + '-' + Date.now());
      schedule_language._slug = _slugify(title);
      schedule_language.updated_at = new Date();
      schedule_language.updated_by = 'system';
      //#endregion
    }

    schedule_language = await schedule_language_service.update(
      schedule_language,
      query_runner.manager,
    );

    return schedule_language;
    //#endregion
  } else {
    //#region add schedule language
    let new_schedule_language = new ScheduleLanguageEntity();
    new_schedule_language.title = title;
    new_schedule_language.slug = _slugify(title + '-' + Date.now());
    new_schedule_language._slug = _slugify(title);
    new_schedule_language.schedule = schedule;
    new_schedule_language.attendee = attendee;
    new_schedule_language.location = location;
    new_schedule_language.content = content;
    new_schedule_language.language_id = language_id;

    new_schedule_language = await schedule_language_service.add(
      new_schedule_language,
      query_runner.manager,
    );

    return new_schedule_language;
    //#endregion
  }
};
