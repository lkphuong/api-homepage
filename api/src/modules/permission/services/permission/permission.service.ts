import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PermissionEntity } from '../../../../entities/permission.entity';

import { LogService } from '../../../log/services/log.service';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly _permissionRepository: Repository<PermissionEntity>,
    private _logger: LogService,
  ) {}

  async getPermissions(): Promise<PermissionEntity[] | null> {
    try {
      const conditions = this._permissionRepository
        .createQueryBuilder('permission')
        .where('permission.deleted = :deleted', { deleted: false });

      const permissions = await conditions
        .orderBy('permission.created_at', 'DESC')
        .getMany();

      return permissions || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'PermissionService.getPermissions()',
        e,
      );
      return null;
    }
  }

  async getPermissionById(id: string): Promise<PermissionEntity | null> {
    try {
      const conditions = this._permissionRepository
        .createQueryBuilder('permission')
        .where('permission.id = :id', { id })
        .andWhere('permission.deleted = :deleted', { deleted: false });

      const permission = await conditions.getOne();

      return permission || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'PermissionService.getPermissionById()',
        e,
      );
      return null;
    }
  }
}
