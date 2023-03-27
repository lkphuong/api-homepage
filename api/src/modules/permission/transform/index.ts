import { PermissionEntity } from '../../../entities/permission.entity';
import { PermissionResponse } from '../interfaces/permission_response.interface';

export const generateData2Array = (permissions: PermissionEntity[]) => {
  const payload: PermissionResponse[] = [];
  if (permissions && permissions.length > 0) {
    for (const permission of permissions) {
      const item: PermissionResponse = {
        id: permission.id,
        code: permission.code,
        name: permission.name,
      };

      payload.push(item);
    }
  }

  return payload;
};
