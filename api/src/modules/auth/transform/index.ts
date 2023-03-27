import { UserEntity } from '../../../entities/user.entity';
import { UserPermissionService } from '../../permission/services/user-permission/user-permission.service';
import {
  PermissionResponse,
  RegisterResponse,
} from '../interfaces/register_response.interface';

export const generate2Object = async (
  user: UserEntity,
  user_permission_service: UserPermissionService,
) => {
  if (user) {
    const payload: RegisterResponse = {
      id: user.id,
      username: user.username,
      active: user.active,
      permissions: [],
    };

    const user_permissions = await user_permission_service.getPermissions(
      user.id,
    );

    if (user.user_permissions && user.user_permissions.length > 0) {
      for (const user_permission of user.user_permissions) {
        const { permission } = user_permission;
        const item: PermissionResponse = {
          id: permission.id,
          code: permission.code,
          name: permission.name,
        };

        payload.permissions.push(item);
      }
    } else {
      for (const user_permission of user_permissions) {
        const { permission } = user_permission;
        const item: PermissionResponse = {
          id: permission.id,
          code: permission.code,
          name: permission.name,
        };

        payload.permissions.push(item);
      }
    }

    return payload;
  }
  return null;
};
