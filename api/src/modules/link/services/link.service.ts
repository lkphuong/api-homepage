import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { LinkLanguageEntity } from '../../../entities/link_language.entity';

import { LogService } from '../../log/services/log.service';

import { Levels } from '../../../constants/enums/level.enum';
import { Methods } from '../../../constants/enums/method.enum';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(LinkLanguageEntity)
    private readonly _linkRepository: Repository<LinkLanguageEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(ids: string[]): Promise<LinkLanguageEntity[] | null> {
    try {
      const conditions = this._linkRepository
        .createQueryBuilder('link')
        .whereInIds(ids)
        .andWhere('link.deleted = false');

      const links = await conditions.getMany();

      return links;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'LinkService.contains()',
        e,
      );
      return null;
    }
  }

  async getLinks(): Promise<LinkLanguageEntity[] | null> {
    try {
      const conditions = this._linkRepository
        .createQueryBuilder('link')
        .where('link.deleted = false');

      const links = await conditions.getMany();

      return links;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'LinkService.getLinks()',
        e,
      );
      return null;
    }
  }

  async update(
    links: LinkLanguageEntity[],
  ): Promise<LinkLanguageEntity[] | null> {
    try {
      // if (!manager) {
      //   //manager = this._dataSource.getRepository(LinkLanguageEntity);
      // }

      links = await this._dataSource
        .getRepository(LinkLanguageEntity)
        .save(links);

      return links || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'LinkService.update()',
        e,
      );
      return null;
    }
  }
}
