import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, QueryRunner } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { generateFailedResponse, generateSuccessResponse } from '../utils';

import { UserEntity } from '../../../entities/user.entity';
import { UserPermissionEntity } from '../../../entities/user_permission.entity';

import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { PermissionService } from '../../permission/services/permission/permission.service';
import { UserPermissionService } from '../../permission/services/user-permission/user-permission.service';
import { UserService } from '../../user/services/user.service';
import { AuthService } from '../services/auth.service';

import { HandlerException } from '../../../exceptions/HandlerException';

import { RegisterDto } from '../dtos/register.dto';

import { validateAccount } from '../validations';

import { Configuration } from '../../shared/constants/configuration.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';

export const createAccount = async (
  params: RegisterDto,
  auth_service: AuthService,
  configuration_service: ConfigurationService,
  permission_service: PermissionService,
  user_service: UserService,
  user_permission_service: UserPermissionService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Get params
  const { username } = params;
  //#endregion

  //#region Validation
  const valid = await validateAccount(username, auth_service, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region Create user
    const user = await createUser(
      params,
      user_service,
      configuration_service,
      query_runner,
    );
    if (user) {
      //#region create user permission
      const user_permissions = await createUserPermissions(
        params,
        user,
        permission_service,
        user_permission_service,
        query_runner,
        req,
      );
      if (user_permissions instanceof HttpException) throw user_permissions;
      //#endregion
      else if (user_permissions) {
        user.user_permissions = user_permissions;
        //#region response
        return await generateSuccessResponse(
          user,
          user_permission_service,
          query_runner,
          req,
        );
        //#endregion
      }
    }
    //#endregion

    throw generateFailedResponse(req, ErrorMessage.OPERATOR_USER_ERROR);
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

export const createUser = async (
  params: RegisterDto,
  user_service: UserService,
  configuration_service: ConfigurationService,
  query_runner: QueryRunner,
) => {
  const { password, username, active } = params;

  const salt = await configuration_service.get(Configuration.SALT);

  const hash = await bcrypt.hash(password, parseInt(salt));
  let user = new UserEntity();
  user.username = username;
  user.password = hash;
  user.active = active;

  user = await user_service.add(user, query_runner.manager);

  return user;
};

export const createUserPermissions = async (
  params: RegisterDto,
  user: UserEntity,
  permission_service: PermissionService,
  user_permission_service: UserPermissionService,
  query_runner: QueryRunner,
  req: Request,
) => {
  const { permissions } = params;

  let user_permissions: UserPermissionEntity[] = [];

  for await (const i of permissions) {
    const permission = await permission_service.getPermissionById(i);
    if (permission) {
      const user_permission = new UserPermissionEntity();
      user_permission.user = user;
      user_permission.permission = permission;
      user_permissions.push(user_permission);
    } else {
      //#region throw HandlerException
      return new HandlerException(
        DATABASE_EXIT_CODE.UNKNOW_VALUE,
        req.method,
        req.url,
        ErrorMessage.PERMISSION_NOT_FOUND_ERROR,
      );
      //#endregion
    }
  }

  //#region create user permissions
  user_permissions = await user_permission_service.bulkAdd(
    user_permissions,
    query_runner.manager,
  );

  return user_permissions;
  //#endregion
};
