import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';

import { _slugify } from '../../../../utils';

import { EventEntity } from '../../../../entities/event.entity';

import { LogService } from '../../../log/services/log.service';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LANGUAGE_DEFAULT } from '../../../../constants';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly _eventRepository: Repository<EventEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async getEventById(id: string): Promise<EventEntity | null> {
    try {
      const conditions = this._eventRepository
        .createQueryBuilder('event')
        .where('event.id = :id', { id })
        .andWhere('event.deleted = :deleted', { deleted: false });

      const event = await conditions.getOne();

      return event || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EventService.getEventById()',
        e,
      );
      return null;
    }
  }

  async getEventPaging(
    offset: number,
    length: number,
    language_id?: string,
    input?: string,
  ): Promise<EventEntity[] | null> {
    try {
      const conditions = this._eventRepository
        .createQueryBuilder('event')
        .innerJoinAndSelect(
          'event.event_languages',
          'event_language',
          `event_language.deleted = false 
              AND event_language.event_id = event.id 
              AND event_language.language_id = :language_id
              `,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('event.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(`event_language._slug LIKE '%${_slugify(input)}%'`);
      }

      const events = await conditions
        .take(length)
        .skip(offset)
        .orderBy('event.created_at', 'DESC')
        .getMany();

      return events || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EventService.getEventPaging()',
        e,
      );
      return null;
    }
  }

  async count(language_id?: string, input?: string): Promise<number> {
    try {
      const conditions = this._eventRepository
        .createQueryBuilder('event')
        .select('COUNT(event.id)', 'count')
        .leftJoin(
          'event.event_languages',
          'event_language',
          `event_language.deleted = false AND event_language.event_id = event.id AND event_language.language_id = :language_id`,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('event.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(`event_language._slug = '%${_slugify(input)}%'`);
      }

      const { count } = await conditions.getRawOne();

      return count || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EventService.count()',
        e,
      );
      return null;
    }
  }

  async add(
    event: EventEntity,
    manager?: EntityManager,
  ): Promise<EventEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      event = await manager.save(event);

      return event || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'EventService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    event: EventEntity,
    manager?: EntityManager,
  ): Promise<EventEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      event = await manager.save(event);

      return event || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'EventService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(event_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        EventEntity,
        { id: event_id },
        { deleted: true },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'EventService.unlink()',
        e,
      );
      return null;
    }
  }
}
