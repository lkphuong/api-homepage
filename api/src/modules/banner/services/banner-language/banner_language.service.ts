import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';

import { BannerLanguageEntity } from '../../../../entities/banner_language.entity';
import { FileEntity } from '../../../../entities/file.entity';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LogService } from '../../../log/services/log.service';

import { LANGUAGE_DEFAULT } from '../../../../constants';

@Injectable()
export class BannerLanguageService {
  constructor(
    @InjectRepository(BannerLanguageEntity)
    private readonly _bannerLanguageRepository: Repository<BannerLanguageEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(
    banner_id: string,
    language_id?: string,
  ): Promise<BannerLanguageEntity> {
    try {
      const conditions = this._bannerLanguageRepository
        .createQueryBuilder('banner_language')
        .innerJoinAndMapOne(
          'banner_language.file',
          FileEntity,
          'file',
          `file.id = banner_language.file_id AND file.deleted = false`,
        )
        .innerJoinAndSelect(
          'banner_language.banner',
          'banner',
          'banner.deleted = false',
        )
        .where('banner_language.banner_id = :banner_id', { banner_id })
        .andWhere('banner_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const banner = await conditions.getOne();

      return banner || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'BannerLanguageService.contains()',
        e,
      );
      return null;
    }
  }

  async getBannerLanguageById(
    banner_id: string,
    language_id?: string,
  ): Promise<BannerLanguageEntity | null> {
    try {
      const conditions = this._bannerLanguageRepository
        .createQueryBuilder('banner_language')
        .innerJoinAndMapOne(
          'banner_language.file',
          FileEntity,
          'file',
          `file.id = banner_language.file_id AND file.deleted = false`,
        )
        .innerJoinAndSelect(
          'banner_language.banner',
          'banner',
          'banner.deleted = false',
        )
        .where('banner_language.banner_id = :banner_id', { banner_id })
        .andWhere('banner_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const banner = await conditions.getOne();

      if (banner) {
        return banner;
      } else {
        const conditions = this._bannerLanguageRepository
          .createQueryBuilder('banner_language')
          .innerJoinAndMapOne(
            'banner_language.file',
            FileEntity,
            'file',
            `file.id = banner_language.file_id AND file.deleted = false`,
          )
          .innerJoinAndSelect(
            'banner_language.banner',
            'banner',
            'banner.deleted = false',
          )
          .where('banner_language.banner_id = :banner_id', { banner_id })
          .andWhere('banner_language.language_id = :language_id', {
            language_id: LANGUAGE_DEFAULT,
          });

        const banner = await conditions.getOne();
        return banner || null;
      }
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'BannerLanguageService.getBannerLanguageById()',
        e,
      );
      return null;
    }
  }

  async add(
    banner_language: BannerLanguageEntity,
    manager?: EntityManager,
  ): Promise<BannerLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      banner_language = await manager.save(banner_language);

      return banner_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'BannerLanguageService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    banner_language: BannerLanguageEntity,
    manager?: EntityManager,
  ): Promise<BannerLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      banner_language = await manager.save(banner_language);

      return banner_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'BannerLanguageService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(
    banner_language_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        BannerLanguageEntity,
        { id: banner_language_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'BannerLanguageService.unlink()',
        e,
      );
      return null;
    }
  }

  async bulkUnlink(
    banner_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        BannerLanguageEntity,
        { banner_id: banner_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'BannerLanguageService.bulkUnlink()',
        e,
      );
      return null;
    }
  }
}
