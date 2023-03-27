import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';

import { EmployeeLanguageEntity } from '../../../../entities/employee_language.entity';
import { FileEntity } from '../../../../entities/file.entity';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LogService } from '../../../log/services/log.service';

import { LANGUAGE_DEFAULT } from '../../../../constants';

@Injectable()
export class EmployeeLanguageService {
  constructor(
    @InjectRepository(EmployeeLanguageEntity)
    private readonly _employeeLanguageRepository: Repository<EmployeeLanguageEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async contains(
    employee_id: string,
    language_id?: string,
  ): Promise<EmployeeLanguageEntity> {
    try {
      const conditions = this._employeeLanguageRepository
        .createQueryBuilder('employee_language')
        .innerJoinAndMapOne(
          'employee_language.file',
          FileEntity,
          'file',
          `file.id = employee_language.file_id AND file.deleted = false`,
        )
        .innerJoinAndSelect(
          'employee_language.employee',
          'employee',
          'employee.deleted = false',
        )
        .where('employee_language.employee_id = :employee_id', { employee_id })
        .andWhere('employee_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const employee = await conditions.getOne();

      return employee || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EmployeeLanguageService.contains()',
        e,
      );
      return null;
    }
  }

  async getEmployeeLanguageById(
    employee_id: string,
    language_id?: string,
  ): Promise<EmployeeLanguageEntity | null> {
    try {
      const conditions = this._employeeLanguageRepository
        .createQueryBuilder('employee_language')
        .innerJoinAndMapOne(
          'employee_language.file',
          FileEntity,
          'file',
          `file.id = employee_language.file_id AND file.deleted = false`,
        )
        .innerJoinAndSelect(
          'employee_language.employee',
          'employee',
          'employee.deleted = false',
        )
        .where('employee_language.employee_id = :employee_id', { employee_id })
        .andWhere('employee_language.language_id = :language_id', {
          language_id: language_id ? language_id : LANGUAGE_DEFAULT,
        });

      const employee = await conditions.getOne();

      if (employee) {
        return employee;
      } else {
        const conditions = this._employeeLanguageRepository
          .createQueryBuilder('employee_language')
          .innerJoinAndMapOne(
            'employee_language.file',
            FileEntity,
            'file',
            `file.id = employee_language.file_id AND file.deleted = false`,
          )
          .innerJoinAndSelect(
            'employee_language.employee',
            'employee',
            'employee.deleted = false',
          )
          .where('employee_language.employee_id = :employee_id', {
            employee_id,
          })
          .andWhere('employee_language.language_id = :language_id', {
            language_id: LANGUAGE_DEFAULT,
          });

        const employee = await conditions.getOne();
        return employee || null;
      }
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EmployeeLanguageService.getEmployeeLanguageById()',
        e,
      );
      return null;
    }
  }

  async add(
    employee_language: EmployeeLanguageEntity,
    manager?: EntityManager,
  ): Promise<EmployeeLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      employee_language = await manager.save(employee_language);

      return employee_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'EmployeeLanguageService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    employee_language: EmployeeLanguageEntity,
    manager?: EntityManager,
  ): Promise<EmployeeLanguageEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      employee_language = await manager.save(employee_language);

      return employee_language || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.UPDATE,
        'EmployeeLanguageService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(
    employee_language_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        EmployeeLanguageEntity,
        { id: employee_language_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'EmployeeLanguageService.unlink()',
        e,
      );
      return null;
    }
  }

  async bulkUnlink(
    employee_id: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        EmployeeLanguageEntity,
        { employee_id: employee_id },
        { deleted: true, deleted_at: new Date(), deleted_by: 'system' },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'EmployeeLanguageService.bulkUnlink()',
        e,
      );
      return null;
    }
  }
}
