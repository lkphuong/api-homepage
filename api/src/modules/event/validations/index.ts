import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { isEmpty, isUUID } from 'class-validator';

import { sprintf } from '../../../utils';

import { EventService } from '../services/event/event.service';
import { FilesService } from '../../file/services/files.service';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import {
  DATABASE_EXIT_CODE,
  VALIDATION_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const validateEventId = (id: string, req: Request) => {
  if (isEmpty(id)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.EMPTY,
      req.method,
      req.url,
      ErrorMessage.EVENT_ID_EMPTY_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  } else if (!isUUID(id)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.INVALID_FORMAT,
      req.method,
      req.url,
      ErrorMessage.ID_NAN_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }

  return null;
};

export const validateLanguageId = (id: string, req: Request) => {
  if (isEmpty(id)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.EMPTY,
      req.method,
      req.url,
      ErrorMessage.ID_NAN_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }

  return null;
};

export const validateFile = async (
  file_id: string,
  file_service: FilesService,
  req: Request,
) => {
  const file = await file_service.getFileById(file_id);
  if (!file) {
    //#region throw HandlerException
    return new UnknownException(
      file_id,
      DATABASE_EXIT_CODE.UNKNOW_VALUE,
      req.method,
      req.url,
      sprintf(ErrorMessage.FILE_NOT_FOUND_ERROR, file_id),
    );
    //#endregion
  }

  return file;
};

export const validateTime = (start: string, end: string, req: Request) => {
  if (
    new Date(start) >= new Date(end) ||
    new Date(start) < new Date() ||
    new Date(end) < new Date()
  ) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.INVALID_FORMAT,
      req.method,
      req.url,
      ErrorMessage.TIME_NAN_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }
  return null;
};

export const validateEvent = async (
  event_id: string,
  event_service: EventService,
  req: Request,
) => {
  const event = await event_service.getEventById(event_id);

  if (!event) {
    //#region throw HandlerException
    return new UnknownException(
      event_id,
      DATABASE_EXIT_CODE.UNKNOW_VALUE,
      req.method,
      req.url,
      sprintf(ErrorMessage.EVENT_NOT_FOUND_ERROR, event_id),
    );
    //#endregion
  }

  return event;
};
