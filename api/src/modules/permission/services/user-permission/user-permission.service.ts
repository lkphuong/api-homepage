import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { UserPermissionEntity } from '../../../../entities/user_permission.entity';

import { LogService } from '../../../log/services/log.service';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

@Injectable()
export class UserPermissionService {
  constructor(
    @InjectRepository(UserPermissionEntity)
    private readonly _userPermissionRepository: Repository<UserPermissionEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(
    user_id: string,
    permission_id: string,
  ): Promise<UserPermissionEntity | null> {
    try {
      const conditions = this._userPermissionRepository
        .createQueryBuilder('user_permission')
        .where('user_permission.user_id', { user_id })
        .andWhere('user_permission.permission_id = :permission_id', {
          permission_id,
        })
        .where('user_permission.deleted = :deleted', { deleted: false });

      const user_permission = await conditions.getOne();

      return user_permission || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'UserPermissionService.contains()',
        e,
      );
      return null;
    }
  }

  async getPermissions(
    user_id: string,
  ): Promise<UserPermissionEntity[] | null> {
    try {
      const conditions = this._userPermissionRepository
        .createQueryBuilder('user_permission')
        .innerJoinAndSelect('user_permission.permission', 'permission')
        .where('user_permission.user_id = :user_id', { user_id })
        .andWhere('user_permission.deleted = :deleted', { deleted: false })
        .andWhere('permission.deleted = :deleted', { deleted: false });

      const user_permissions = await conditions.getMany();

      return user_permissions || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'UserPermissionService.getPermissions()',
        e,
      );
      return null;
    }
  }

  async bulkAdd(
    user_permissions: UserPermissionEntity[],
    manager?: EntityManager,
  ): Promise<UserPermissionEntity[] | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      user_permissions = await manager.save(user_permissions);

      return user_permissions || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'UserPermissionService.bulkAdd()',
        e,
      );
      return null;
    }
  }

  async bulkUnlink(user_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        UserPermissionEntity,
        { user_id: user_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'UserPermissionService.bulkUnlink()',
        e,
      );
      return null;
    }
  }
}
