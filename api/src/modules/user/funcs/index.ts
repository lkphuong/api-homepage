import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, QueryRunner } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { generateFailedResponse } from '../utils';
import { removeDuplicates, sprintf } from '../../../utils';
import { generateSuccessResponse } from '../../auth/utils';

import { UserEntity } from '../../../entities/user.entity';
import { UserPermissionEntity } from '../../../entities/user_permission.entity';

import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { PermissionService } from '../../permission/services/permission/permission.service';
import { UserPermissionService } from '../../permission/services/user-permission/user-permission.service';
import { UserService } from '../../user/services/user.service';

import { HandlerException } from '../../../exceptions/HandlerException';

import { UpdateUserDto } from '../dtos/update.dto';

import { Configuration } from '../../shared/constants/configuration.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';

export const UpdateAccount = async (
  user_id: string,
  params: UpdateUserDto,
  configuration_service: ConfigurationService,
  permission_service: PermissionService,
  user_service: UserService,
  user_permission_service: UserPermissionService,
  data_source: DataSource,
  req: Request,
) => {
  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region Create user
    const user = await updateUser(
      user_id,
      params,
      user_service,
      configuration_service,
      query_runner,
      req,
    );
    if (user instanceof HttpException) throw user;
    else {
      //#region create user permission
      const user_permissions = await updateUserPermissions(
        user_id,
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

export const updateUser = async (
  id: string,
  params: UpdateUserDto,
  user_service: UserService,
  configuration_service: ConfigurationService,
  query_runner: QueryRunner,
  req: Request,
) => {
  const { password, active } = params;
  const salt = await configuration_service.get(Configuration.SALT);

  let user = await user_service.getUserById(id);

  if (user) {
    if (password) {
      const hash = await bcrypt.hash(password, parseInt(salt));
      user.password = hash;
    }
    user.active = active;
    user.updated_at = new Date();
    user.updated_by = 'system';

    user = await user_service.add(user, query_runner.manager);

    return user;
  } else {
    //#region throw HandlerException
    return new HandlerException(
      DATABASE_EXIT_CODE.UNKNOW_VALUE,
      req.method,
      req.url,
      sprintf(ErrorMessage.USER_NOT_FOUND_ERROR, id),
    );
    //#endregion
  }
};

export const updateUserPermissions = async (
  user_id: string,
  params: UpdateUserDto,
  user: UserEntity,
  permission_service: PermissionService,
  user_permission_service: UserPermissionService,
  query_runner: QueryRunner,
  req: Request,
) => {
  let { permissions } = params;

  if (permissions && permissions.length > 0) {
    //#region old permission
    await user_permission_service.bulkUnlink(user_id, query_runner.manager);
    //#endregion

    let user_permissions: UserPermissionEntity[] = [];

    //#region remove duplicate
    permissions = removeDuplicates(permissions);
    //#endregion

    for await (const i of permissions) {
      const permission = await permission_service.getPermissionById(i);
      if (permission) {
        const user_permission = new UserPermissionEntity();
        user_permission.user = user;
        user_permission.permission = permission;
        user_permission.created_at = new Date();
        user_permission.created_by = 'system';
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
  }
  //#endregion
};
