import { UserEntity } from '../../../entities/user.entity';
import { UserResponse } from '../interfaces/user_response.interface';

export const generateData2Array = (users: UserEntity[]) => {
  const payload: UserResponse[] = [];
  if (users) {
    for (const user of users) {
      const { id, username, created_at, updated_at, active } = user;
      const item: UserResponse = {
        id,
        username,
        created_at,
        updated_at,
        active,
      };
      payload.push(item);
    }
  }

  return payload;
};
