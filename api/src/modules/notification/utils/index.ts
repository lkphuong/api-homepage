import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';

import { returnObjects, returnObjectsWithPaging } from '../../../utils';

import { NotificationLanguageEntity } from '../../../entities/notification_language.entity';
import { NotificationEntity } from '../../../entities/notification.entity';

import { generateData2Array, generateData2Object } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { NotificationResponse } from '../interfaces/notification_response.interface';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const generateArraySuccessResponse = async (
  pages: number,
  page: number,
  notifications: NotificationEntity[],
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);

  // Transform UserEntity class to NotificationResponse class
  const payload = generateData2Array(notifications);

  return returnObjectsWithPaging<NotificationResponse>(pages, page, payload);
};

export const generateSuccessResponse = async (
  notification_language: NotificationLanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', notification_language);

  // Transform UserEntity class to BannerResponse class
  const payload = generateData2Object(notification_language);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateDeleteSuccessResponse = async (
  notification: NotificationEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', notification);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects({ id: notification.id });
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_NOTIFICATION_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
