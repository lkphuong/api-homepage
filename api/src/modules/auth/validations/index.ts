import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { VALIDATION_EXIT_CODE } from '../../../constants/enums/error_code.enum';

import { HandlerException } from '../../../exceptions/HandlerException';
import { sprintf } from '../../../utils';
import { ErrorMessage } from '../constants/enums/errors.enum';

import { AuthService } from '../services/auth.service';

export const validateAccount = async (
  username: string,
  auth_service: AuthService,
  req: Request,
): Promise<HttpException | null> => {
  const user = await auth_service.getUserByUsername(username);

  if (user) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.UNIQUE_VALUE,
      req.method,
      req.url,
      sprintf(ErrorMessage.USERNAME_DUPLICATE_ERROR, username),
      HttpStatus.BAD_REQUEST,
    );
  }

  return null;
};
