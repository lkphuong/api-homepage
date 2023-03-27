import { Request } from 'express';

import { returnObjects } from '../../../utils';

import { PermissionEntity } from '../../../entities/permission.entity';

import { generateData2Array } from '../transform';

import { PermissionResponse } from '../interfaces/permission_response.interface';

export const generateArraySuccessResponse = async (
  permissions: PermissionEntity[],
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);

  // Transform UserEntity class to NotificationResponse class
  const payload = generateData2Array(permissions);

  return returnObjects<PermissionResponse>(payload);
};
