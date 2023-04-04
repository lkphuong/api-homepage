import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';

import { returnObjects, returnObjectsWithPaging } from '../../../utils';

import { LanguageEntity } from '../../../entities/language.entity';

import { generateData2Array, generateData2Object } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { LanguageResponse } from '../interfaces/language_response.interface';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const generateArraySuccessResponse = async (
  pages: number,
  page: number,
  language: LanguageEntity[],
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);

  // Transform UserEntity class to LanguageResponse class
  const payload = generateData2Array(language);

  return returnObjectsWithPaging<LanguageResponse>(pages, page, payload);
};

export const generateSuccessResponse = async (
  language: LanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', language);

  // Transform UserEntity class to LanguageResponse class
  const payload = generateData2Object(language);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateResponse = async (
  languages: LanguageEntity[],
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', languages);

  // Transform UserEntity class to LanguageResponse class
  const payload = generateData2Array(languages);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateDeleteSuccessResponse = async (
  language: LanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', language);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects({ id: language.id });
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_LANGUAGE_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
