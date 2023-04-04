import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';

import { PositionEntity } from '../../../../entities/position.entity';

import { LogService } from '../../../log/services/log.service';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LANGUAGE_DEFAULT } from '../../../../constants';
import { _slugify } from '../../../../utils';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly _positionRepository: Repository<PositionEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async getPositionById(id: string): Promise<PositionEntity | null> {
    try {
      const conditions = this._positionRepository
        .createQueryBuilder('position')
        .where('position.id = :id', { id })
        .andWhere('position.deleted = :deleted', { deleted: false });

      const position = await conditions.getOne();

      return position || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'PositionService.getPositionById()',
        e,
      );
      return null;
    }
  }

  async getPositionPaging(
    offset: number,
    length: number,
    language_id?: string,
    input?: string,
  ): Promise<PositionEntity[] | null> {
    try {
      const conditions = this._positionRepository
        .createQueryBuilder('position')
        .innerJoinAndSelect(
          'position.position_languages',
          'position_language',
          `position_language.position_id = position.id 
              AND position_language.deleted = false 
              AND position_language.language_id = :language_id`,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('position.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(
          `position_language._slug LIKE '%${_slugify(input)}%'`,
        );
      }

      const positions = await conditions
        .take(length)
        .skip(offset)
        .orderBy('position.created_at', 'DESC')
        .getMany();

      return positions || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'PositionService.getPositionPaging()',
        e,
      );
      return null;
    }
  }

  async count(language_id?: string, input?: string): Promise<number> {
    try {
      const conditions = this._positionRepository
        .createQueryBuilder('position')
        .select('COUNT(position.id)', 'count')
        .innerJoinAndSelect(
          'position.position_languages',
          'position_language',
          `position_language.position_id = position.id 
                AND position_language.deleted = false 
                AND position_language.language_id = :language_id`,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('position.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(
          `position_language._slug LIKE '%${_slugify(input)}%'`,
        );
      }

      const { count } = await conditions.getRawOne();

      return count || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'PositionService.count()',
        e,
      );
      return null;
    }
  }

  async add(
    position: PositionEntity,
    manager?: EntityManager,
  ): Promise<PositionEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      position = await manager.save(position);

      return position;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'PositionService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    position: PositionEntity,
    manager?: EntityManager,
  ): Promise<PositionEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      position = await manager.save(position);

      return position;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'PositionService.update()',
        e,
      );
      return null;
    }
  }

  async active(
    position: PositionEntity,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        PositionEntity,
        { id: position.id },
        { active: !position.active },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'PositionService.active()',
        e,
      );
      return null;
    }
  }

  async unlink(position_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        PositionEntity,
        { id: position_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'PositionService.unlink()',
        e,
      );
      return null;
    }
  }
}
