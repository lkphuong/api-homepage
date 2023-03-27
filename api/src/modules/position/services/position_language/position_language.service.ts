import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';

import { PositionLanguageEntity } from '../../../../entities/position_language.entity';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LogService } from '../../../log/services/log.service';

import { LANGUAGE_DEFAULT } from '../../../../constants';
@Injectable()
export class PositionLanguageService {
  constructor(
    @InjectRepository(PositionLanguageEntity)
    private readonly _positionLanguageRepository: Repository<PositionLanguageEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(
    position_id: string,
    language_id: string,
  ): Promise<PositionLanguageEntity | null> {
    try {
      const conditions = this._positionLanguageRepository
        .createQueryBuilder('position_language')
        .innerJoinAndSelect(
          'position_language.position',
          'position',
          'position.deleted = :deleted AND position.id = :position_id',
          { deleted: false, position_id },
        )
        .where('position_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const position_language = await conditions.getOne();

      return position_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'PositionLanguageService.contains()',
        e,
      );
      return null;
    }
  }

  async getPositionLanguageById(
    position_id: string,
    language_id: string,
  ): Promise<PositionLanguageEntity | null> {
    try {
      const conditions = this._positionLanguageRepository
        .createQueryBuilder('position_language')
        .innerJoinAndSelect(
          'position_language.position',
          'position',
          'position.deleted = :deleted AND position.id = :position_id',
          { deleted: false, position_id },
        )
        .where('position_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const position_language = await conditions.getOne();

      if (position_language) {
        return position_language;
      } else {
        const conditions = this._positionLanguageRepository
          .createQueryBuilder('position_language')
          .innerJoinAndSelect(
            'position_language.position',
            'position',
            'position.deleted = :deleted AND position.id = :position_id',
            { deleted: false, position_id },
          )
          .where('position_language.language_id = :language_id', {
            language_id: language_id ? language_id : LANGUAGE_DEFAULT,
          });

        const position_language = await conditions.getOne();

        return position_language || null;
      }
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'PositionLanguageService.getPositionLanguageById()',
        e,
      );
      return null;
    }
  }

  async add(
    position_language: PositionLanguageEntity,
    manager?: EntityManager,
  ): Promise<PositionLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      position_language = await manager.save(position_language);

      return position_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'PositionLanguageService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    position_language: PositionLanguageEntity,
    manager?: EntityManager,
  ): Promise<PositionLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      position_language = await manager.save(position_language);

      return position_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'PositionLanguageService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(
    position_language_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        PositionLanguageEntity,
        { id: position_language_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'PositionLanguageService.unlink()',
        e,
      );
      return null;
    }
  }

  async bulkUnlink(
    position_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        PositionLanguageEntity,
        { position_id: position_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'PositionLanguageService.bulkUnlink()',
        e,
      );
      return null;
    }
  }
}
