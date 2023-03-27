import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, QueryRunner } from 'typeorm';

import {
  generateDeleteSuccessResponse,
  generateFailedResponse,
  generateSuccessResponse,
} from '../utils';
import { _slugify } from '../../../utils';

import { NotificationEntity } from '../../../entities/notification.entity';
import { NotificationLanguageEntity } from '../../../entities/notification_language.entity';

import { CreateNotificationDto } from '../dtos/create_notification.dto';
import { UpdateNotificationDto } from '../dtos/update_notification.dto';

import { NotificationService } from '../services/notification/notification.service';
import { NotificationLanguageService } from '../services/notification-language/notification_language.service';

import { HandlerException } from '../../../exceptions/HandlerException';

import { validateNotification, validateNotificationId } from '../validations';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { LANGUAGE_DEFAULT } from '../../../constants';

export const createNotification = async (
  param: CreateNotificationDto,
  notification_service: NotificationService,
  notification_language_service: NotificationLanguageService,
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

    //#region create notification
    const notification = await addNotification(
      published,
      notification_service,
      query_runner,
    );
    if (notification) {
      //#region create notification language
      const notification_language = await addNotificationLanguage(
        title,
        notification,
        notification_language_service,
        query_runner,
      );
      if (notification_language) {
        //#region generate response
        return await generateSuccessResponse(
          notification_language,
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

export const deleteNotification = async (
  notification_id: string,
  notification_service: NotificationService,
  notification_language_service: NotificationLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Validate notification_id
  const valid = validateNotificationId(notification_id, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  //#region validate notification
  const valid_noti = await validateNotification(
    notification_id,
    notification_service,
    req,
  );
  if (valid_noti instanceof HttpException) throw valid_noti;
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();
    //#endregion

    //#region delete notification
    const notification = await notification_service.unlink(
      notification_id,
      query_runner.manager,
    );
    if (notification) {
      //#region delete notification language
      const notification_language =
        await notification_language_service.bulkUnlink(
          notification_id,
          query_runner.manager,
        );
      if (notification_language) {
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

export const updateNotification = async (
  notification_id: string,
  params: UpdateNotificationDto,
  notification_service: NotificationService,
  notification_language_service: NotificationLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Get params
  const { published } = params;
  //#endregion

  //#region Validate notification id
  const valid = validateNotificationId(notification_id, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  //#region validate notification
  const valid_noti = await validateNotification(
    notification_id,
    notification_service,
    req,
  );
  if (valid_noti instanceof HttpException) throw valid_noti;
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();
  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region update notification
    const notification = await editNotification(
      notification_id,
      published,
      notification_service,
      query_runner,
    );
    if (notification) {
      //#region update notification language
      const notification_language = await editNotificationLanguage(
        notification_id,
        notification,
        params,
        notification_language_service,
        query_runner,
      );

      if (notification_language) {
        //#region generate response
        return await generateSuccessResponse(
          notification_language,
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

export const addNotification = async (
  published: boolean,
  notification_service: NotificationService,
  query_runner: QueryRunner,
) => {
  let notification = new NotificationEntity();
  notification.published = published;
  notification.created_at = new Date();
  notification.created_by = 'system';

  notification = await notification_service.add(
    notification,
    query_runner.manager,
  );

  return notification;
};

export const addNotificationLanguage = async (
  title: string,
  notification: NotificationEntity,
  notification_language_service: NotificationLanguageService,
  query_runner: QueryRunner,
) => {
  let notification_language = new NotificationLanguageEntity();
  notification_language.notification = notification;
  notification_language.title = title;
  notification_language.slug = _slugify(title );
  notification_language.language_id = LANGUAGE_DEFAULT;
  notification_language.created_at = new Date();
  notification_language.created_by = 'system';

  notification_language = await notification_language_service.add(
    notification_language,
    query_runner.manager,
  );

  return notification_language;
};

export const editNotification = async (
  notification_id: string,
  published: boolean,
  notification_service: NotificationService,
  query_runner: QueryRunner,
) => {
  let notification = await notification_service.getNotificationById(
    notification_id,
  );

  notification.published = published;
  notification.updated_at = new Date();
  notification.updated_by = 'system';

  notification = await notification_service.update(
    notification,
    query_runner.manager,
  );

  return notification;
};

export const editNotificationLanguage = async (
  notification_id: string,
  notification: NotificationEntity,
  param: UpdateNotificationDto,
  notification_language_service: NotificationLanguageService,
  query_runner: QueryRunner,
) => {
  const { language_id, title } = param;

  let notification_language = await notification_language_service.contains(
    notification_id,
    language_id,
  );

  if (notification_language) {
    //#region edit notification
    notification_language.title = title;
    notification_language.slug = _slugify(title );
    notification_language.updated_at = new Date();
    notification_language.updated_by = 'system';

    notification_language = await notification_language_service.update(
      notification_language,
      query_runner.manager,
    );

    return notification_language;
    //#endregion
  } else {
    //#region update new noti language
    let new_notification_language = new NotificationLanguageEntity();
    new_notification_language.title = title;
    new_notification_language.slug = _slugify(title );
    new_notification_language.notification = notification;
    new_notification_language.language_id = language_id;
    new_notification_language.created_at = new Date();
    new_notification_language.created_by = 'system';

    new_notification_language = await notification_language_service.add(
      new_notification_language,
      query_runner.manager,
    );

    return new_notification_language;
    //#endregion
  }
};
