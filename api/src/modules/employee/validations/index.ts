import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { isEmpty, isUUID } from 'class-validator';

import { sprintf } from '../../../utils';

import { EmployeeService } from '../services/employee/employee.service';
import { FilesService } from '../../file/services/files.service';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import {
  DATABASE_EXIT_CODE,
  VALIDATION_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const validateEmployeeId = (id: string, req: Request) => {
  if (isEmpty(id)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.EMPTY,
      req.method,
      req.url,
      ErrorMessage.EMPLOYEE_ID_EMPTY_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  } else if (!isUUID(id)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.INVALID_FORMAT,
      req.method,
      req.url,
      ErrorMessage.ID_NAN_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }

  return null;
};

export const validateLanguageId = (id: string, req: Request) => {
  if (isEmpty(id)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.EMPTY,
      req.method,
      req.url,
      ErrorMessage.EMPLOYEE_ID_EMPTY_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }

  return null;
};

export const validateFile = async (
  file_id: string,
  file_service: FilesService,
  req: Request,
) => {
  const file = await file_service.getFileById(file_id);
  if (!file) {
    //#region throw HandlerException
    return new UnknownException(
      file_id,
      DATABASE_EXIT_CODE.UNKNOW_VALUE,
      req.method,
      req.url,
      sprintf(ErrorMessage.FILE_NOT_FOUND_ERROR, file_id),
    );
    //#endregion
  }

  return file;
};

export const validateTime = (start: string, end: string, req: Request) => {
  if (new Date(start) > new Date(end)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.INVALID_FORMAT,
      req.method,
      req.url,
      ErrorMessage.TIME_NAN_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }
  return null;
};

export const validateEmployee = async (
  employee_id: string,
  employee_service: EmployeeService,
  req: Request,
) => {
  const employee = await employee_service.getEmployeeById(employee_id);

  if (!employee) {
    //#region throw HandlerException
    return new UnknownException(
      employee_id,
      DATABASE_EXIT_CODE.UNKNOW_VALUE,
      req.method,
      req.url,
      sprintf(ErrorMessage.EMPLOYEE_NOT_FOUND_ERROR, employee_id),
    );
    //#endregion
  }

  return employee;
};
