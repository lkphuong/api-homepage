import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';

import { returnObjectsWithPaging } from '../../../utils';

import { UserEntity } from '../../../entities/user.entity';

import { generateData2Array } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { UserResponse } from '../interfaces/user_response.interface';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const generateArraySuccessResponse = async (
  pages: number,
  page: number,
  users: UserEntity[],
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);

  // Transform UserEntity class to UserResponse class
  const payload = generateData2Array(users);

  return returnObjectsWithPaging<UserResponse>(pages, page, payload);
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_USER_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
