import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';

import { _slugify } from '../../../../utils';

import { EmployeeEntity } from '../../../../entities/employee.entity';

import { LogService } from '../../../log/services/log.service';

import { Levels } from '../../../../constants/enums/level.enum';
import { Methods } from '../../../../constants/enums/method.enum';

import { LANGUAGE_DEFAULT } from '../../../../constants';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly _employeeRepository: Repository<EmployeeEntity>,
    private readonly _dataSource: DataSource,
    private _logger: LogService,
  ) {}

  async getEmployeeById(id: string): Promise<EmployeeEntity | null> {
    try {
      const conditions = this._employeeRepository
        .createQueryBuilder('employee')
        .where('employee.id = :id', { id })
        .andWhere('employee.deleted = :deleted', { deleted: false });

      const employee = await conditions.getOne();

      return employee;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EmployeeService.getBannerById()',
        e,
      );
      return null;
    }
  }

  async getEmployeePaging(
    offset: number,
    length: number,
    language_id?: string,
    input?: string,
  ): Promise<EmployeeEntity[] | null> {
    try {
      const conditions = this._employeeRepository
        .createQueryBuilder('employee')
        .innerJoinAndSelect(
          'employee.employee_languages',
          'employee_language',
          `employee_language.deleted = false 
              AND employee_language.employee_id = employee.id 
              AND employee_language.language_id = :language_id
              `,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('employee.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(
          `employee_language._slug LIKE '%${_slugify(input)}%'`,
        );
      }

      const employees = await conditions
        .take(length)
        .skip(offset)
        .orderBy('employee.created_at', 'DESC')
        .getMany();

      return employees || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EmployeeService.getEmployeePaging()',
        e,
      );
      return null;
    }
  }

  async count(language_id?: string, input?: string): Promise<number> {
    try {
      const conditions = this._employeeRepository
        .createQueryBuilder('employee')
        .select('COUNT(employee.id)', 'count')
        .leftJoin(
          'employee.employee_languages',
          'employee_language',
          `employee_language.deleted = false AND employee_language.employee_id = employee.id AND employee_language.language_id = :language_id`,
          { language_id: language_id ? language_id : LANGUAGE_DEFAULT },
        )
        .where('employee.deleted = :deleted', { deleted: false });

      if (input) {
        conditions.andWhere(
          `employee_language._slug LIKE '%${_slugify(input)}%'`,
        );
      }

      const { count } = await conditions.getRawOne();

      return count || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.SELECT,
        'EmployeeService.count()',
        e,
      );
      return null;
    }
  }

  async add(
    employee: EmployeeEntity,
    manager?: EntityManager,
  ): Promise<EmployeeEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      employee = await manager.save(employee);

      return employee || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'EmployeeService.add()',
        e,
      );
      return null;
    }
  }

  async update(
    employee: EmployeeEntity,
    manager?: EntityManager,
  ): Promise<EmployeeEntity | null> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }

      employee = await manager.save(employee);

      return employee || null;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.INSERT,
        'EmployeeService.update()',
        e,
      );
      return null;
    }
  }

  async unlink(employee_id: string, manager?: EntityManager): Promise<boolean> {
    try {
      if (!manager) {
        manager = this._dataSource.manager;
      }
      const result = await manager.update(
        EmployeeEntity,
        { id: employee_id },
        { deleted: true },
      );

      return result.affected > 0;
    } catch (e) {
      this._logger.writeLog(
        Levels.ERROR,
        Methods.DELETE,
        'EmployeeService.unlink()',
        e,
      );
      return null;
    }
  }
}
