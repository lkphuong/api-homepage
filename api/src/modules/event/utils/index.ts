import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';

import { returnObjects, returnObjectsWithPaging } from '../../../utils';

import { EventEntity } from '../../../entities/event.entity';
import { EventLanguageEntity } from '../../../entities/event_language.entity';

import { generateData2Array, generateData2Object } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { EventResponse } from '../interfaces/event_response.interface';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const generateArraySuccessResponse = async (
  pages: number,
  page: number,
  events: EventEntity[],
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);

  // Transform UserEntity class to EventResponse class
  const payload = generateData2Array(events);

  return returnObjectsWithPaging<EventResponse>(pages, page, payload);
};

export const generateSuccessResponse = async (
  event_language: EventLanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', event_language);

  // Transform UserEntity class to EventResponse class
  const payload = generateData2Object(event_language);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateDeleteSuccessResponse = async (
  event: EventEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', event);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects({ id: event.id });
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_EVENT_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
