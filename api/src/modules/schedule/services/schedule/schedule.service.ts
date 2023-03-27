import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { _slugify } from '../../../../utils';

import { ScheduleEntity } from '../../../../entities/schedule.entity';

import { LogService } from '../../../log/services/log.service';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LANGUAGE_DEFAULT } from '../../../../constants';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly _scheduleRepository: Repository<ScheduleEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async getScheduleById(id: string): Promise<ScheduleEntity | null> {
    try {
      const conditions = this._scheduleRepository
        .createQueryBuilder('schedule')
        .where('schedule.id = :id', { id })
        .andWhere('schedule.deleted = :deleted', { deleted: false });

      const schedule = await conditions.getOne();

      return schedule || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'ScheduleService.getScheduleById()',
        e,
      );
      return null;
    }
  }

  async getSchedulePaging(
    offset: number,
    length: number,
    language_id?: string,
    input?: string,
  ): Promise<ScheduleEntity[] | null> {
    try {
      const conditions = this._scheduleRepository
        .createQueryBuilder('schedule')
        .innerJoinAndSelect(
          'schedule.schedule_languages',
          'schedule_language',
          `schedule_language.schedule_id = schedule.id AND schedule_language.deleted = false AND schedule_language.language_id = :language_id`,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        );

      if (input) {
        conditions.andWhere(
          `schedule_language._slug LIKE '%${_slugify(input)}%'`,
        );
      }

      const schedules = await conditions
        .take(length)
        .skip(offset)
        .orderBy('schedule.created_at', 'DESC')
        .getMany();

      return schedules || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'ScheduleService.getSchedulePaging()',
        e,
      );
      return null;
    }
  }

  async count(language_id?: string, input?: string): Promise<number> {
    try {
      const conditions = this._scheduleRepository
        .createQueryBuilder('schedule')
        .select('COUNT(schedule.id)', 'count')
        .innerJoinAndSelect(
          'schedule.schedule_language',
          'schedule_language',
          `schedule_language.schedule_id = schedule.id AND schedule_language.deleted = false AND schedule_language.language_id = :language_id`,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        );

      if (input) {
        conditions.andWhere(
          `schedule_language._slug LINK '%${_slugify(input)}%'`,
        );
      }

      const { count } = await conditions.getRawOne();

      return count || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'ScheduleService.count()',
        e,
      );
      return null;
    }
  }

  async add(
    schedule: ScheduleEntity,
    manager?: EntityManager,
  ): Promise<ScheduleEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      schedule = await manager.save(schedule);

      return schedule || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'ScheduleService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    schedule: ScheduleEntity,
    manager?: EntityManager,
  ): Promise<ScheduleEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      schedule = await manager.save(schedule);

      return schedule || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'ScheduleService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(schedule_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        ScheduleEntity,
        { id: schedule_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'ScheduleService.unlink()',
        e,
      );
      return null;
    }
  }
}
