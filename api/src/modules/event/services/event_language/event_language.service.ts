import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';

import { EventLanguageEntity } from '../../../../entities/event_language.entity';
import { FileEntity } from '../../../../entities/file.entity';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LogService } from '../../../log/services/log.service';

import { LANGUAGE_DEFAULT } from '../../../../constants';
@Injectable()
export class EventLanguageService {
  constructor(
    @InjectRepository(EventLanguageEntity)
    private readonly _eventLanguageRepository: Repository<EventLanguageEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(
    event_id: string,
    language_id?: string,
  ): Promise<EventLanguageEntity> {
    try {
      const conditions = this._eventLanguageRepository
        .createQueryBuilder('event_language')
        .innerJoinAndMapOne(
          'event_language.file',
          FileEntity,
          'file',
          `file.id = event_language.file_id AND file.deleted = false`,
        )
        .innerJoinAndSelect(
          'event_language.event',
          'event',
          'event.deleted = false',
        )
        .where('event_language.event_id = :event_id', { event_id })
        .andWhere('event_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const event = await conditions.getOne();

      return event || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EventLanguageService.contains()',
        e,
      );
      return null;
    }
  }

  async getEventLanguageById(
    event_id: string,
    language_id?: string,
  ): Promise<EventLanguageEntity | null> {
    try {
      const conditions = this._eventLanguageRepository
        .createQueryBuilder('event_language')
        .innerJoinAndMapOne(
          'event_language.file',
          FileEntity,
          'file',
          `file.id = event_language.file_id AND file.deleted = false`,
        )
        .innerJoinAndSelect(
          'event_language.event',
          'event',
          'event.deleted = false',
        )
        .where('event_language.event_id = :event_id', { event_id })
        .andWhere('event_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const event = await conditions.getOne();

      if (event) {
        return event;
      } else {
        const conditions = this._eventLanguageRepository
          .createQueryBuilder('event_language')
          .innerJoinAndMapOne(
            'event_language.file',
            FileEntity,
            'file',
            `file.id = event_language.file_id AND file.deleted = false`,
          )
          .innerJoinAndSelect(
            'event_language.event',
            'event',
            'event.deleted = false',
          )
          .where('event_language.event_id = :event_id', { event_id })
          .andWhere('event_language.language_id = :language_id', {
            language_id: LANGUAGE_DEFAULT,
          });

        const event = await conditions.getOne();

        return event || null;
      }
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EventLanguageService.getEventLanguageById()',
        e,
      );
      return null;
    }
  }

  async add(
    event_language: EventLanguageEntity,
    manager?: EntityManager,
  ): Promise<EventLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      event_language = await manager.save(event_language);

      return event_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'EventLanguageService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    event_language: EventLanguageEntity,
    manager?: EntityManager,
  ): Promise<EventLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      event_language = await manager.save(event_language);

      return event_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'EventLanguageService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(
    event_language_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        EventLanguageEntity,
        { id: event_language_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'EventLanguageService.unlink()',
        e,
      );
      return null;
    }
  }

  async bulkUnlink(
    event_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        EventLanguageEntity,
        { event_id: event_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'EventLanguageService.bulkUnlink()',
        e,
      );
      return null;
    }
  }
}
