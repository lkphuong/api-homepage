import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';

import { returnObjects, returnObjectsWithPaging } from '../../../utils';

import { ScheduleEntity } from '../../../entities/schedule.entity';
import { ScheduleLanguageEntity } from '../../../entities/schedule_language.entity';

import { generateData2Array, generateData2Object } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { SchedulePagingResponse } from '../interfaces/schedule_response.interface';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const _date = (raw: string) => {
  return new Date(raw).toISOString().slice(0, 10);
};

export const _hour = (raw: string) => {
  return new Date(raw).toLocaleTimeString('en-US', { timeZone: 'UTC' });
};

export const _timestampWithoutTimeZone = (raw: string) => {
  const date = new Date(raw);
  return (
    date.toISOString().replace('T', '') +
    date.getUTCMilliseconds().toString().padStart(3, '0')
  );
};

export const generateArraySuccessResponse = async (
  pages: number,
  page: number,
  schedules: ScheduleEntity[],
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);

  // Transform UserEntity class to SchedulePagingResponse class
  const payload = generateData2Array(schedules);

  return returnObjectsWithPaging<SchedulePagingResponse>(pages, page, payload);
};

export const generateSuccessResponse = async (
  schedule_language: ScheduleLanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', schedule_language);

  // Transform UserEntity class to ScheduleLanguageResponse class
  const payload = generateData2Object(schedule_language);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateDeleteSuccessResponse = async (
  schedule: ScheduleEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', schedule);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects({ id: schedule.id });
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_SCHEDULE_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
