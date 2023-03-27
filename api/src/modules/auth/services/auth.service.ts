import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';

import { UserEntity } from '../../../entities/user.entity';
import { SessionEntity } from '../../../entities/session.entity';

import { LogService } from '../../log/services/log.service';

import { Levels } from '../../../constants/enums/level.enum';
import { Methods } from '../../../constants/enums/method.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly _sessionRepository: Repository<SessionEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(username: string): Promise<SessionEntity | null> {
    try {
      const conditions = this._sessionRepository
        .createQueryBuilder('session')
        .where('session.username = :username', { username })
        .andWhere('session.active = :active', { active: true })
        .andWhere('session.deleted = :deleted', { deleted: false });

      const session = await conditions.getOne();
      return session || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'AuthService.contains()',
        e,
      );
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<UserEntity | null> {
    try {
      const conditions = await this._userRepository
        .createQueryBuilder('user')
        .where('user.username = :username', { username })
        .andWhere('user.active = :active', { active: true })
        .andWhere('user.deleted = :deleted', { deleted: false });

      const user = await conditions.getOne();

      return user || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'AuthService.getUserByUsername()',
        e,
      );
      return null;
    }
  }

  async isValid(refresh_token: string): Promise<SessionEntity | null> {
    try {
      const conditions = this._sessionRepository
        .createQueryBuilder('session')
        .where('session.refresh_token = :refresh_token', { refresh_token })
        .andWhere(
          new Brackets((qb) => {
            qb.where('session.expired_time IS NULL');
            qb.andWhere('session.logout_time IS NULL');
          }),
        )
        .andWhere('session.active = :active', { active: true });

      const session = await conditions.getOne();
      return session || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'AuthService.isValid()',
        e,
      );
      return null;
    }
  }

  async getProfile(user_id: string): Promise<SessionEntity | null> {
    try {
      const conditions = this._sessionRepository
        .createQueryBuilder('session')
        .where('session.user_id = :user_id', { user_id })
        .andWhere('session.active = :active', { active: true })
        .andWhere('session.deleted = :deleted', { deleted: false });

      const session = await conditions.getOne();
      return session || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'AuthService.getProfile()',
        e,
      );
      return null;
    }
  }

  async add(
    user_id: string,
    username: string,
    access_token: string,
    refresh_token: string,
    login_time: Date,
    active: boolean,
    manager?: EntityManager,
  ): Promise<SessionEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      let session = new SessionEntity();
      session.user_id = user_id;
      session.username = username;
      session.access_token = access_token;
      session.refresh_token = refresh_token;
      session.login_time = login_time;
      session.active = active;
      session.created_at = new Date();
      session.created_by = 'system';
      session.deleted = false;

      session = await manager.save(session);
      return session || null;
    } catch (e) {
      console.log(e);
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'AuthService.add()',
        e,
      );
      return null;
    }
  }

  async renew(
    access_token: string,
    refresh_token: string,
    session: SessionEntity,
    manager?: EntityManager,
  ): Promise<SessionEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      session.access_token = access_token;
      session.refresh_token = refresh_token;
      session.updated_at = new Date();
      session.updated_by = 'system';

      session = await manager.save(session);
      return session || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'AuthService.renew()',
        e,
      );
      return null;
    }
  }

  async update(
    expired_time: Date,
    logout_time: Date,
    session: SessionEntity,
    manager?: EntityManager,
  ): Promise<SessionEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      session.access_token = null;
      session.expired_time = expired_time;
      session.logout_time = logout_time;
      session.updated_at = new Date();
      session.updated_by = 'system';
      session.deleted = false;

      session = await manager.save(session);
      return session || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'AuthService.update()',
        e,
      );
      return null;
    }
  }
}
