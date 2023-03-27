import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { isEmpty, isUUID } from 'class-validator';

import { sprintf, _slugify } from '../../../utils';
import { LanguageService } from '../services/language.service';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import {
  DATABASE_EXIT_CODE,
  VALIDATION_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const validateLanguageId = (id: string, req: Request) => {
  if (isEmpty(id)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.EMPTY,
      req.method,
      req.url,
      ErrorMessage.LANGUAGE_NOT_FOUND_ERROR,
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

export const validateLanguage = async (
  language_id: string,
  language_service: LanguageService,
  req: Request,
) => {
  const language = await language_service.getLanguageById(language_id);
  if (!language) {
    //#region throw HandlerException
    return new UnknownException(
      language_id,
      DATABASE_EXIT_CODE.UNKNOW_VALUE,
      req.method,
      req.url,
      sprintf(ErrorMessage.LANGUAGE_NOT_FOUND_ERROR, language_id),
    );
    //#endregion
  }

  return language;
};

export const validateSlugLanguage = async (
  name: string,
  language_service: LanguageService,
  req: Request,
) => {
  const language = await language_service.getLanguageBySlug(_slugify(name));
  if (language) {
    return new HandlerException(
      DATABASE_EXIT_CODE.UNIQUE_FIELD_VALUE,
      req.method,
      req.url,
      sprintf(ErrorMessage.LANGUAGE_HAS_EXIST_ERROR, name),
      HttpStatus.BAD_REQUEST,
    );
  }

  return null;
};
