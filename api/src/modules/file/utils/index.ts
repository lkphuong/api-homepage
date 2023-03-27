import { HttpStatus } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

import { Request } from 'express';

import { sprintf } from '../../../utils';

import { FileEntity } from '../../../entities/file.entity';

import { HandlerException } from '../../../exceptions/HandlerException';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const generateUploadFileSuccessResponse = async (
  req: Request,
  file: FileEntity | null,
  query_runner: QueryRunner,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', file);

  // Commit transaction
  await query_runner.commitTransaction();

  return {
    data: {
      id: file.id,
      originalName: file.originalName,
      url: `/${file.url}`,
      extension: file.extension,
    },
    errorCode: 0,
    message: null,
    errors: null,
  };
};

export const generateUploadFileFailedResponse = async (
  original_name: string,
  query_runner: QueryRunner,
  req: Request,
) => {
  // Rollback transaction
  await query_runner.rollbackTransaction();

  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    sprintf(ErrorMessage.OPERATOR_UPLOAD_FILE_ERROR, original_name),
    HttpStatus.EXPECTATION_FAILED,
  );
};
