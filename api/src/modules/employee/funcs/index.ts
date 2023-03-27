import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, QueryRunner } from 'typeorm';

import {
  generateDeleteSuccessResponse,
  generateFailedResponse,
  generateSuccessResponse,
} from '../utils';
import { _slugify } from '../../../utils';

import {
  validateEmployee,
  validateEmployeeId,
  validateFile,
} from '../validations';

import { EmployeeEntity } from '../../../entities/employee.entity';
import { EmployeeLanguageEntity } from '../../../entities/employee_language.entity';
import { FileEntity } from '../../../entities/file.entity';

import { CreateEmployeeDto } from '../dtos/create_employee.dto';
import { UpdateEmployeeDto } from '../dtos/update_employee.dto';

import { EmployeeService } from '../services/employee/employee.service';
import { FilesService } from '../../file/services/files.service';
import { EmployeeLanguageService } from '../services/employee-language/employee_language.service';

import { HandlerException } from '../../../exceptions/HandlerException';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';

export const createEmployee = async (
  params: CreateEmployeeDto,
  employee_service: EmployeeService,
  employee_language_service: EmployeeLanguageService,
  file_service: FilesService,
  data_source: DataSource,
  req: Request,
) => {
  const { file_id } = params;
  //#region validate file
  const file = await validateFile(file_id, file_service, req);
  if (file instanceof HttpException) throw file;
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region Create employee
    const employee = await addEmployee(params, employee_service, query_runner);
    if (employee) {
      //#region create employee language
      const employee_language = await addEmployeeLanguage(
        params,
        employee,
        file,
        employee_language_service,
        file_service,
        query_runner,
      );
      if (employee_language) {
        //#region generate response
        return await generateSuccessResponse(
          employee_language,
          query_runner,
          req,
        );
        //#endregion
      }
      //#endregion
    }
    //#endregion

    throw generateFailedResponse(req);
  } catch (err) {
    // Rollback transaction
    await query_runner.rollbackTransaction();

    console.log('--------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + err.message);

    if (err instanceof HttpException) return err;
    else {
      //#region throw HandlerException
      return new HandlerException(
        SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
        req.method,
        req.url,
      );
      //#endregion
    }
  } finally {
    // Release transaction
    await query_runner.release();
  }
};

export const updateEmployee = async (
  employee_id: string,
  params: UpdateEmployeeDto,
  employee_service: EmployeeService,
  employee_language_service: EmployeeLanguageService,
  file_service: FilesService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Get params
  const { file_id } = params;
  //#endregion

  //#region Validation
  //#region Validate employee
  const employee = await validateEmployee(employee_id, employee_service, req);
  if (employee instanceof HttpException) throw employee;
  //#endregion
  //#region Validate file
  const file = await validateFile(file_id, file_service, req);
  if (file instanceof HttpException) throw file;
  //#endregion
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region update employee
    const employee = await editEmployee(
      employee_id,
      params,
      employee_service,
      query_runner,
    );

    if (employee) {
      //#region Update employee language
      const employee_language = await editEmployeeLanguage(
        employee_id,
        employee,
        file,
        params,
        employee_language_service,
        file_service,
        query_runner,
      );

      if (employee_language) {
        //#region generate response
        return await generateSuccessResponse(
          employee_language,
          query_runner,
          req,
        );
        //#endregion
      }
      //#endregion
    }

    throw generateFailedResponse(req);
    //#endregion
  } catch (err) {
    // Rollback transaction
    await query_runner.rollbackTransaction();

    console.log('--------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + err.message);

    if (err instanceof HttpException) return err;
    else {
      //#region throw HandlerException
      return new HandlerException(
        SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
        req.method,
        req.url,
      );
      //#endregion
    }
  } finally {
    // Release transaction
    await query_runner.release();
  }
};

export const deleteEmployee = async (
  employee_id: string,
  employee_service: EmployeeService,
  employee_language_service: EmployeeLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Validation
  //#region validate employee id
  const valid = validateEmployeeId(employee_id, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  //#region validate employee
  const employee = await validateEmployee(employee_id, employee_service, req);
  if (employee instanceof HttpException) throw employee;
  //#endregion

  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();
    //#endregion

    //#region delete employee
    const delete_employee = await employee_service.unlink(
      employee_id,
      query_runner.manager,
    );
    if (delete_employee) {
      const delete_employee_language =
        await employee_language_service.bulkUnlink(
          employee_id,
          query_runner.manager,
        );

      if (delete_employee_language) {
        //#region generate response
        return await generateDeleteSuccessResponse(employee, query_runner, req);
        //#endregion
      }
    }

    throw generateFailedResponse(req);
    //#endregion
  } catch (err) {
    // Rollback transaction
    await query_runner.rollbackTransaction();

    console.log('--------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + err.message);

    if (err instanceof HttpException) return err;
    else {
      //#region throw HandlerException
      return new HandlerException(
        SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
        req.method,
        req.url,
      );
      //#endregion
    }
  } finally {
    // Release transaction
    await query_runner.release();
  }
};

export const addEmployee = async (
  params: CreateEmployeeDto,
  employee_service: EmployeeService,
  query_runner: QueryRunner,
) => {
  const { published } = params;

  let employee = new EmployeeEntity();
  employee.published = published;

  employee = await employee_service.add(employee, query_runner.manager);

  return employee;
};

export const addEmployeeLanguage = async (
  params: CreateEmployeeDto,
  employee: EmployeeEntity,
  file: FileEntity,
  employee_language_service: EmployeeLanguageService,
  file_service: FilesService,
  query_runner: QueryRunner,
) => {
  const { name, academic_degree, language_id } = params;

  let employee_language = new EmployeeLanguageEntity();
  employee_language.employee = employee;
  employee_language.name = name;
  employee_language.slug = _slugify(name + '-' + Date.now());
  employee_language._slug = _slugify(name);
  employee_language.academic_degree = academic_degree;
  employee_language.file_id = file.id;
  employee_language.language_id = language_id;

  //#region update file
  file.drafted = false;
  file.updated_at = new Date();
  file.updated_by = 'system';
  file = await file_service.update(file, query_runner.manager);
  //#endregion

  employee_language = await employee_language_service.add(
    employee_language,
    query_runner.manager,
  );

  return employee_language;
};

export const editEmployee = async (
  employee_id: string,
  params: UpdateEmployeeDto,
  employee_service: EmployeeService,
  query_runner: QueryRunner,
) => {
  const { published } = params;
  let employee = await employee_service.getEmployeeById(employee_id);

  employee.published = published;

  employee = await employee_service.update(employee, query_runner.manager);

  return employee;
};

export const editEmployeeLanguage = async (
  employee_id: string,
  employee: EmployeeEntity,
  file: FileEntity,
  params: UpdateEmployeeDto,
  employee_language_service: EmployeeLanguageService,
  file_service: FilesService,
  query_runner: QueryRunner,
) => {
  const { language_id, academic_degree, name, deleted } = params;

  let update_files: FileEntity[] = [];

  let employee_language = await employee_language_service.contains(
    employee_id,
    language_id,
  );
  if (employee_language) {
    //#region edit or delete
    if (deleted) {
      //#region delete
      employee_language.deleted = true;
      employee_language.deleted_at = new Date();
      employee_language.deleted_by = 'system';
      //#endregion

      //#region delete file
      file.drafted = true;
      file.deleted = true;
      file.deleted_at = new Date();
      file.deleted_by = 'system';
      //#endregion
    } else {
      //#region edit
      employee_language.name = name;
      employee_language.slug = _slugify(name + '-' + Date.now());
      employee_language._slug = _slugify(name);
      employee_language.file_id = file.id;
      employee_language.updated_at = new Date();
      employee_language.updated_by = 'system';
      //#endregion

      //#region update file
      if (file.id != employee_language.file_id) {
        //#region delete old file
        const old_file = employee_language.file;
        old_file.drafted = true;
        old_file.deleted = true;
        old_file.deleted_at = new Date();
        old_file.deleted_by = 'system';
        //#endregion

        //#region update new file
        file.drafted = false;
        file.updated_at = new Date();
        file.updated_by = 'system';
        //#endregion

        update_files.push(old_file, file);
      }
      //#endregion
    }
    update_files = await file_service.bulkUpdate(
      update_files,
      query_runner.manager,
    );

    employee_language = await employee_language_service.update(
      employee_language,
      query_runner.manager,
    );

    return employee_language;
    //#endregion
  } else {
    //#region add employee language
    let new_employee_language = new EmployeeLanguageEntity();
    new_employee_language.name = name;
    new_employee_language.slug = _slugify(name + '-' + Date.now());
    new_employee_language._slug = _slugify(name);
    new_employee_language.employee = employee;
    new_employee_language.academic_degree = academic_degree;
    new_employee_language.file_id = file.id;
    new_employee_language.language_id = language_id;

    new_employee_language = await employee_language_service.add(
      new_employee_language,
      query_runner.manager,
    );

    //#region update new file
    file.drafted = false;
    file.updated_at = new Date();
    file.updated_by = 'system';
    //#endregion

    await file_service.update(file, query_runner.manager);

    return new_employee_language;
    //#endregion
  }
};
