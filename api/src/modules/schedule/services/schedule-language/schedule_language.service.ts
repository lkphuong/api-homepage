import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';

import { ScheduleLanguageEntity } from '../../../../entities/schedule_language.entity';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LogService } from '../../../log/services/log.service';

import { LANGUAGE_DEFAULT } from '../../../../constants';

@Injectable()
export class ScheduleLanguageService {
  constructor(
    @InjectRepository(ScheduleLanguageEntity)
    private readonly _scheduleLanguageRepository: Repository<ScheduleLanguageEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(
    schedule_id: string,
    language_id: string,
  ): Promise<ScheduleLanguageEntity | null> {
    try {
      const conditions = this._scheduleLanguageRepository
        .createQueryBuilder('schedule_language')
        .innerJoinAndSelect(
          'schedule_language.schedule',
          'schedule',
          `schedule.deleted = :deleted AND schedule.id = :schedule_id`,
          { deleted: false, schedule_id },
        )
        .where('schedule_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const schedule_language = await conditions.getOne();

      return schedule_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'ScheduleLanguageService.contains()',
        e,
      );
      return null;
    }
  }

  async getScheduleLanguageById(
    schedule_id: string,
    language_id: string,
  ): Promise<ScheduleLanguageEntity | null> {
    try {
      const conditions = this._scheduleLanguageRepository
        .createQueryBuilder('schedule_language')
        .innerJoinAndSelect(
          'schedule_language.schedule',
          'schedule',
          `schedule.deleted = :deleted AND schedule.id = :schedule_id`,
          { deleted: false, schedule_id },
        )
        .where('schedule_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const schedule_language = await conditions.getOne();

      if (schedule_language) {
        return schedule_language;
      } else {
        const conditions = this._scheduleLanguageRepository
          .createQueryBuilder('schedule_language')
          .innerJoinAndSelect(
            'schedule_language.schedule',
            'schedule',
            `schedule.deleted = :deleted AND schedule.id = :schedule_id`,
            { deleted: false, schedule_id },
          )
          .where('schedule_language.language_id = :language_id', {
            language_id: LANGUAGE_DEFAULT,
          });

        const schedule_language = await conditions.getOne();

        return schedule_language || null;
      }
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'ScheduleLanguageService.getScheduleLanguageById()',
        e,
      );
      return null;
    }
  }

  async add(
    schedule_language: ScheduleLanguageEntity,
    manager?: EntityManager,
  ): Promise<ScheduleLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      schedule_language = await manager.save(schedule_language);

      return schedule_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'ScheduleLanguageService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    schedule_language: ScheduleLanguageEntity,
    manager?: EntityManager,
  ): Promise<ScheduleLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      schedule_language = await manager.save(schedule_language);

      return schedule_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'ScheduleLanguageService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(
    schedule_language_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        ScheduleLanguageEntity,
        { id: schedule_language_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'ScheduleLanguageService.unlink()',
        e,
      );
      return null;
    }
  }

  async bulkUnlink(
    schedule_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        ScheduleLanguageEntity,
        { schedule_id: schedule_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'ScheduleLanguageService,bulkUnlink()',
        e,
      );
      return null;
    }
  }
}
