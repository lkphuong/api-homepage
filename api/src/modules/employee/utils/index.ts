import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';

import { returnObjects, returnObjectsWithPaging } from '../../../utils';

import { EmployeeEntity } from '../../../entities/employee.entity';
import { EmployeeLanguageEntity } from '../../../entities/employee_language.entity';

import { generateData2Array, generateData2Object } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { EmployeePagingResponse } from '../interfaces/employee_response.interface';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const generateArraySuccessResponse = async (
  pages: number,
  page: number,
  employees: EmployeeEntity[],
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);

  // Transform UserEntity class to EmployeePagingResponse class
  const payload = generateData2Array(employees);

  return returnObjectsWithPaging<EmployeePagingResponse>(pages, page, payload);
};

export const generateSuccessResponse = async (
  employee_language: EmployeeLanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', employee_language);

  // Transform UserEntity class to EmployeeLanguageResponse class
  const payload = generateData2Object(employee_language);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateDeleteSuccessResponse = async (
  employee: EmployeeEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', employee);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects({ id: employee.id });
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_EMPLOYEE_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
