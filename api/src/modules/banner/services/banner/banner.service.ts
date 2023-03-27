import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';

import { _slugify } from '../../../../utils';

import { BannerEntity } from '../../../../entities/banner.entity';

import { LogService } from '../../../log/services/log.service';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LANGUAGE_DEFAULT } from '../../../../constants';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(BannerEntity)
    private readonly _bannerRepository: Repository<BannerEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async getBannerById(id: string): Promise<BannerEntity | null> {
    try {
      const conditions = this._bannerRepository
        .createQueryBuilder('banner')
        .where('banner.id = :id', { id })
        .andWhere('banner.deleted = :deleted', { deleted: false });

      const banner = await conditions.getOne();

      return banner;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'BannerService.getBannerById()',
        e,
      );
      return null;
    }
  }

  async getBannerPaging(
    offset: number,
    length: number,
    language_id?: string,
    input?: string,
  ): Promise<BannerEntity[] | null> {
    try {
      const conditions = this._bannerRepository
        .createQueryBuilder('banner')
        .innerJoinAndSelect(
          'banner.banner_languages',
          'banner_language',
          `banner_language.deleted = false 
          AND banner_language.banner_id = banner.id 
          AND banner_language.language_id = :language_id
          `,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('banner.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(
          `banner_language._slug LIKE '%${_slugify(input)}%'`,
        );
      }

      const banners = await conditions
        .take(length)
        .skip(offset)
        .orderBy('banner.created_at', 'DESC')
        .getMany();

      return banners || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'BannerService.getBannerPaging()',
        e,
      );
      return null;
    }
  }

  async count(language_id?: string, input?: string): Promise<number> {
    try {
      const conditions = this._bannerRepository
        .createQueryBuilder('banner')
        .select('COUNT(banner.id)', 'count')
        .leftJoin(
          'banner.banner_languages',
          'banner_language',
          `banner_language.deleted = false AND banner_language.banner_id = banner.id AND banner_language.language_id = :language_id`,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('banner.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(
          `banner_language._slug LIKE '%${_slugify(input)}%'`,
        );
      }

      const { count } = await conditions.getRawOne();

      return count || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'BannerService.count()',
        e,
      );
      return null;
    }
  }

  async add(
    banner: BannerEntity,
    manager?: EntityManager,
  ): Promise<BannerEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      banner = await manager.save(banner);

      return banner || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'BannerService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    banner: BannerEntity,
    manager?: EntityManager,
  ): Promise<BannerEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      banner = await manager.save(banner);

      return banner || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'BannerService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(banner_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        BannerEntity,
        { id: banner_id },
        { deleted: true },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'BannerService.unlink()',
        e,
      );
      return null;
    }
  }
}
