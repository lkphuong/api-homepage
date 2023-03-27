import { HttpStatus } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

import { returnObjects } from '../../../utils';

import { SessionEntity } from '../../../entities/session.entity';
import { UserEntity } from '../../../entities/user.entity';

import { generate2Object } from '../transform';

import { ConfigurationService } from '../../shared/services/configuration/configuration.service';

import { JwtPayload } from '../interfaces/payloads/jwt_payload.interface';
import { LoginResponse } from '../interfaces/login_response.interface';

import { HandlerException } from '../../../exceptions/HandlerException';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import { Configuration } from '../../shared/constants/configuration.enum';
import { UserPermissionService } from '../../permission/services/user-permission/user-permission.service';

export const generateAccessToken = (
  jwtService: JwtService,
  configurationService: ConfigurationService,
  user_id: string,
  username: string,
): string => {
  //#region generate access_token
  const payload: JwtPayload = {
    user_id: user_id,
    username: username,
  };

  const access_token = jwtService.sign(payload, {
    secret: configurationService.get(Configuration.ACCESS_SECRET_KEY),
    expiresIn: configurationService.get(Configuration.ACCESS_TOKEN_EXPIRESIN),
  });
  //#endregion

  return access_token;
};

export const generateRefreshToken = (
  jwtService: JwtService,
  configurationService: ConfigurationService,
  std_code: string,
) => {
  //#region generate refresh_token
  const refresh_token = jwtService.sign(
    {
      username: std_code,
    },
    {
      secret: configurationService.get(Configuration.REFRESH_SECRET_KEY),
      expiresIn: configurationService.get(
        Configuration.REFRESH_TOKEN_EXPIRESIN,
      ),
    },
  );
  //#endregion

  return refresh_token;
};

export const generateResponse = async (
  session: SessionEntity,
  access_token: string,
  refresh_token: string,
  req: Request,
) => {
  console.log('------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', session);

  // Returns object
  return returnObjects<LoginResponse>({
    username: session.username,
    access_token: access_token,
    refresh_token: refresh_token,
  });
};

export const validatePassword = async (
  password: string,
  user_password: string,
) => {
  return await bcrypt.compare(password, user_password);
};

export const generateSuccessResponse = async (
  user: UserEntity,
  user_permission_service: UserPermissionService,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', user);

  // Transform UserEntity class to UserResponse class
  const payload = await generate2Object(user, user_permission_service);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return {
    data: payload,
    errorCode: 0,
    message: null,
    errors: null,
  };
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
