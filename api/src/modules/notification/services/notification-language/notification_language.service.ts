import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';

import { NotificationLanguageEntity } from '../../../../entities/notification_language.entity';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LogService } from '../../../log/services/log.service';

import { LANGUAGE_DEFAULT } from '../../../../constants';

@Injectable()
export class NotificationLanguageService {
  constructor(
    @InjectRepository(NotificationLanguageEntity)
    private readonly _notiLanguageRepository: Repository<NotificationLanguageEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(
    noti_id: string,
    language_id: string,
  ): Promise<NotificationLanguageEntity | null> {
    try {
      const conditions = this._notiLanguageRepository
        .createQueryBuilder('noti_language')
        .innerJoinAndSelect(
          'noti_language.notification',
          'noti',
          'noti.deleted = :deleted AND noti.id = :noti_id',
          { deleted: false, noti_id },
        )
        .where('noti_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const noti_language = await conditions.getOne();

      return noti_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'NotificationLanguageService.contains()',
        e,
      );
      return null;
    }
  }

  async getNotiLanguageById(
    noti_id: string,
    language_id: string,
  ): Promise<NotificationLanguageEntity | null> {
    try {
      const conditions = this._notiLanguageRepository
        .createQueryBuilder('noti_language')
        .innerJoinAndSelect(
          'noti_language.notification',
          'noti',
          'noti.deleted = :deleted AND noti.id = :noti_id',
          { deleted: false, noti_id },
        )
        .where('noti_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const noti_language = await conditions.getOne();

      if (noti_language) {
        return noti_language;
      } else {
        const conditions = this._notiLanguageRepository
          .createQueryBuilder('noti_language')
          .innerJoinAndSelect(
            'noti_language.notification',
            'noti',
            'noti.deleted = :deleted AND noti.id = :noti_id',
            { deleted: false, noti_id },
          )
          .where('noti_language.language_id = :language_id', {
            language_id: language_id ? language_id : LANGUAGE_DEFAULT,
          });

        const noti_language = await conditions.getOne();

        return noti_language || null;
      }
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'NotificationLanguageService.getNotiLanguageById()',
        e,
      );
      return null;
    }
  }

  async add(
    noti_language: NotificationLanguageEntity,
    manager?: EntityManager,
  ): Promise<NotificationLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      noti_language = await manager.save(noti_language);

      return noti_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'NotificationLanguageService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    noti_language: NotificationLanguageEntity,
    manager?: EntityManager,
  ): Promise<NotificationLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      noti_language = await manager.save(noti_language);

      return noti_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'NotificationLanguageService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(
    noti_language_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        NotificationLanguageEntity,
        { id: noti_language_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'NotificationLanguageService.unlink()',
        e,
      );
      return null;
    }
  }

  async bulkUnlink(noti_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        NotificationLanguageEntity,
        { notification_id: noti_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'NotificationLanguageService.bulkUnlink()',
        e,
      );
      return null;
    }
  }
}
