import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { isEmpty, isUUID } from 'class-validator';
import { VALIDATION_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { HandlerException } from '../../../exceptions/HandlerException';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const validateUserId = (id: string, req: Request) => {
  if (isEmpty(id)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.EMPTY,
      req.method,
      req.url,
      ErrorMessage.USER_ID_EMPTY_ERROR,
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
