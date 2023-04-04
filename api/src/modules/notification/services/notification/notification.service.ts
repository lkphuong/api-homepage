import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';

import { NotificationEntity } from '../../../../entities/notification.entity';

import { LogService } from '../../../log/services/log.service';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LANGUAGE_DEFAULT } from '../../../../constants';
import { _slugify } from '../../../../utils';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly _notificationRepository: Repository<NotificationEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async getNotificationById(id: string): Promise<NotificationEntity | null> {
    try {
      const conditions = this._notificationRepository
        .createQueryBuilder('noti')
        .where('noti.id = :id', { id })
        .andWhere('noti.deleted = :deleted', { deleted: false });

      const notification = await conditions.getOne();

      return notification || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'NotificationService.getNotificationById()',
        e,
      );
      return null;
    }
  }

  async getNotificationPaging(
    offset: number,
    length: number,
    language_id?: string,
    input?: string,
  ): Promise<NotificationEntity[] | null> {
    try {
      const conditions = this._notificationRepository
        .createQueryBuilder('noti')
        .innerJoinAndSelect(
          'noti.notification_languages',
          'noti_language',
          `noti_language.notification_id = noti.id 
          AND noti_language.deleted = false 
          AND noti_language.language_id = :language_id`,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('noti.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(`noti_language._slug LIKE '%${_slugify(input)}%'`);
      }

      const notifications = await conditions
        .take(length)
        .skip(offset)
        .orderBy('noti.created_at', 'DESC')
        .getMany();

      return notifications || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'NotificationService.getNotificationPaging()',
        e,
      );
      return null;
    }
  }

  async count(language_id?: string, input?: string): Promise<number> {
    try {
      const conditions = this._notificationRepository
        .createQueryBuilder('noti')
        .select('COUNT(noti.id)', 'count')
        .innerJoinAndSelect(
          'noti.notification_languages',
          'noti_language',
          `noti_language.notification_id = noti.id 
            AND noti_language.deleted = false 
            AND noti_language.language_id = :language_id`,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('noti.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(`noti_language._slug LIKE '%${_slugify(input)}%'`);
      }

      const { count } = await conditions.getRawOne();

      return count || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'NotificationService.count()',
        e,
      );
      return null;
    }
  }

  async add(
    notification: NotificationEntity,
    manager?: EntityManager,
  ): Promise<NotificationEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      notification = await manager.save(notification);

      return notification;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'NotificationService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    notification: NotificationEntity,
    manager?: EntityManager,
  ): Promise<NotificationEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      notification = await manager.save(notification);

      return notification;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'NotificationService.update()',
        e,
      );
      return null;
    }
  }

  async active(
    notification: NotificationEntity,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        NotificationEntity,
        { id: notification.id },
        { active: !notification.active },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'NotificationService.active()',
        e,
      );
      return null;
    }
  }

  async unlink(
    notification_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        NotificationEntity,
        { id: notification_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'NotificationService.unlink()',
        e,
      );
      return null;
    }
  }
}
