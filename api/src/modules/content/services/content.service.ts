import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';

import { ContentEntity } from '../../../entities/content.entity';

import { LogService } from '../../log/services/log.service';

import { Levels } from '../../../constants/enums/level.enum';
import { Methods } from '../../../constants/enums/method.enum';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentEntity)
    private readonly _contentRepository: Repository<ContentEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async getContentBySourceId(source_id: string): Promise<ContentEntity | null> {
    try {
      const conditions = this._contentRepository
        .createQueryBuilder('content')
        .where('content.source_id = :source_id', { source_id })
        .andWhere('content.deleted = :deleted', { deleted: false });

      const content = await conditions.getOne();

      return content || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'ContentService.getContentBySourceId()',
        e,
      );
      return null;
    }
  }

  async add(
    content: ContentEntity,
    manager?: EntityManager,
  ): Promise<ContentEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      content = await manager.save(content);

      return content || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'ContentService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    content: ContentEntity,
    manager?: EntityManager,
  ): Promise<ContentEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      content = await manager.save(content);

      return content || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'ContentService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(source_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        ContentEntity,
        { source_id: source_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'ContentService.unlink()',
        e,
      );
      return null;
    }
  }
}
