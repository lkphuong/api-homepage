import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { LanguageEntity } from '../../../entities/language.entity';

import { LogService } from '../../log/services/log.service';

import { Levels } from '../../../constants/enums/level.enum';
import { Methods } from '../../../constants/enums/method.enum';

import { _slugify } from '../../../utils';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(LanguageEntity)
    private readonly _languageRepository: Repository<LanguageEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(
    language_id: string,
    name: string,
  ): Promise<LanguageEntity | null> {
    try {
      const conditions = this._languageRepository
        .createQueryBuilder('language')
        .where('language._slug = :_slug', { _slug: _slugify(name) })
        .andWhere('language.id != :language_id', { language_id })
        .andWhere('language.deleted = :deleted', { deleted: false });

      const language = await conditions.getOne();

      return language;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'LanguageService.contains()',
        e,
      );
      return null;
    }
  }

  async getAll(): Promise<LanguageEntity[] | null> {
    try {
      const conditions = this._languageRepository
        .createQueryBuilder('language')
        .where('language.deleted = :deleted', { deleted: false });

      const languages = await conditions.getMany();

      return languages || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'LanguageService.getAll()',
        e,
      );
      return null;
    }
  }

  async getLanguagePaging(
    offset: number,
    length: number,
    input?: string,
  ): Promise<LanguageEntity[] | null> {
    try {
      const conditions = this._languageRepository
        .createQueryBuilder('language')
        .where('language.deleted = :deleted', { deleted: false });
      if (input) {
        conditions.andWhere(`language._slug LIKE '%${_slugify(input)}%'`);
      }

      const languages = await conditions
        .take(length)
        .skip(offset)
        .orderBy('language.created_at', 'DESC')
        .getMany();

      return languages || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'LanguageService.getLanguagePaging()',
        e,
      );
      return null;
    }
  }

  async getLanguageBySlug(_slug: string): Promise<LanguageEntity | null> {
    try {
      const conditions = this._languageRepository
        .createQueryBuilder('language')
        .where('language._slug = :_slug', { _slug })
        .andWhere('language.deleted = :deleted', { deleted: false });

      const language = await conditions.getOne();

      return language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'LanguageService.getAll()',
        e,
      );
      return null;
    }
  }

  async getLanguageById(language_id: string): Promise<LanguageEntity | null> {
    try {
      const conditions = this._languageRepository
        .createQueryBuilder('language')
        .where('language.id = :language_id', { language_id })
        .andWhere('language.deleted = :deleted', { deleted: false });

      const language = await conditions.getOne();

      return language;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'LanguageService.getLanguageById()',
        e,
      );
      return null;
    }
  }

  async count(input?: string): Promise<number> {
    try {
      const conditions = this._languageRepository
        .createQueryBuilder('language')
        .select('COUNT(language.id)', 'count')
        .where('language.deleted = :deleted', { deleted: false });
      if (input) {
        conditions.andWhere(`language._slug LIKE '%${_slugify(input)}%'`);
      }

      const { count } = await conditions.getRawOne();

      return count || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'LanguageService.count()',
        e,
      );
      return null;
    }
  }

  async add(
    language: LanguageEntity,
    manager?: EntityManager,
  ): Promise<LanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      language = await manager.save(language);

      return language;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'LanguageService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    language: LanguageEntity,
    manager?: EntityManager,
  ): Promise<LanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      language = await manager.save(language);

      return language;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'LanguageService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(language_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      const result = await manager.update(
        LanguageEntity,
        { id: language_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'LanguageService.unlink()',
        e,
      );
      return null;
    }
  }
}
