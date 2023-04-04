import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager } from 'typeorm';

import { UserEntity } from '../../../entities/user.entity';

import { LogService } from '../../log/services/log.service';

import { Levels } from '../../../constants/enums/level.enum';
import { Methods } from '../../../constants/enums/method.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async getUsersPaging(
    offset: number,
    length: number,
    input?: string,
  ): Promise<UserEntity[] | null> {
    try {
      const conditions = this._userRepository
        .createQueryBuilder('user')
        .where('user.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(`user.username LIKE '%${input}%'`);
      }

      const users = await conditions
        .orderBy('user.created_at', 'DESC')
        .skip(offset)
        .take(length)
        .getMany();

      return users || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'UserService.getUsersPaging()',
        e,
      );
      return null;
    }
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    try {
      const conditions = this._userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        .andWhere('user.deleted = :deleted', { deleted: false });

      const user = await conditions.getOne();

      return user || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'UserService.getUserById()',
        e,
      );
      return null;
    }
  }

  async count(input?: string): Promise<number> {
    try {
      let conditions = this._userRepository
        .createQueryBuilder('user')
        .select('COUNT(user.id)', 'count')
        .where('user.deleted = :deleted', { deleted: false });

      if (input) {
        conditions = conditions.andWhere(`user.username LIKE '%${input}%'`);
      }

      const { count } = await conditions.getRawOne();

      return count || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'UserService.count()',
        e,
      );
      return null;
    }
  }

  async add(
    user: UserEntity,
    manager?: EntityManager,
  ): Promise<UserEntity | null> {
    try {
      if (manager) {
        manager = this._dataSource.manager;
      }

      user = await manager.save(user);

      return user || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'UserService.add()',
        e,
      );
      return null;
    }
  }

  async active(user: UserEntity): Promise<boolean> {
    try {
      const result = await this._dataSource.manager.update(
        UserEntity,
        { id: user.id },
        { active: !user.active },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'UserService.active()',
        e,
      );
      return null;
    }
  }

  async update(
    user: UserEntity,
    manager?: EntityManager,
  ): Promise<UserEntity | null> {
    try {
      if (manager) {
        manager = this._dataSource.manager;
      }

      user = await manager.save(user);

      return user || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'UserService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(id: string, manager?: EntityManager): Promise<boolean | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        UserEntity,
        { id: id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      console.log('result: ', result);

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'UserService.unlink()',
        e,
      );
      return null;
    }
  }
}
