import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';

import { FooterLanguageEntity } from '../../../entities/footer_language.entity';

import { LogService } from '../../log/services/log.service';

import { Levels } from '../../../constants/enums/level.enum';

import { LANGUAGE_DEFAULT } from '../../../constants';

import { ContentEntity } from '../../../entities/content.entity';

import { Methods } from '../../../constants/enums/method.enum';

@Injectable()
export class FooterService {
  constructor(
    @InjectRepository(FooterLanguageEntity)
    private readonly _footerRepository: Repository<FooterLanguageEntity>,
    private readonly _dataSource: DataSource,
    private readonly _logger: LogService,
  ) {}

  async contains(langauge_id: string): Promise<FooterLanguageEntity> {
    try {
      const conditions = this._footerRepository
        .createQueryBuilder('footer')
        .where(`footer.language_id = '${langauge_id ?? LANGUAGE_DEFAULT}'`)
        .andWhere('footer.deleted = false');

      const footer = await conditions.getOne();

      return footer;
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

  async getFooter(language_id?: string): Promise<FooterLanguageEntity> {
    try {
      language_id = language_id ?? LANGUAGE_DEFAULT;
      const conditions = this._footerRepository
        .createQueryBuilder('footer')
        .innerJoinAndMapOne(
          'footer.content',
          ContentEntity,
          'content',
          'content.source_id = footer.id AND content.deleted = false',
        )
        .where('footer.deleted = false AND footer.language_id = :language_id', {
          language_id,
        });

      const footer = await conditions.getOne();

      return footer;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'FooterService.getFooter()',
        e,
      );
      return null;
    }
  }

  async add(footer: FooterLanguageEntity, manager?: EntityManager) {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      footer = await manager.save(footer);

      return footer || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'FooterService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    footer: FooterLanguageEntity,
    manager?: EntityManager,
  ): Promise<FooterLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      footer = await manager.save(footer);

      return footer || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'FooterService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(footer_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        FooterLanguageEntity,
        { id: footer_id },
        { deleted: true },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'FooterService.unlink()',
        e,
      );
      return null;
    }
  }
}
