import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';

import { returnObjects, returnObjectsWithPaging } from '../../../utils';

import { PositionLanguageEntity } from '../../../entities/position_language.entity';
import { PositionEntity } from '../../../entities/position.entity';

import { generateData2Array, generateData2Object } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { PositionResponse } from '../interfaces/position_response.interface';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const generateArraySuccessResponse = async (
  pages: number,
  page: number,
  positions: PositionEntity[],
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);

  // Transform UserEntity class to PositionResponse class
  const payload = generateData2Array(positions);

  return returnObjectsWithPaging<PositionResponse>(pages, page, payload);
};

export const generateSuccessResponse = async (
  position_language: PositionLanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', position_language);

  // Transform UserEntity class to PositionResponse class
  const payload = generateData2Object(position_language);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateDeleteSuccessResponse = async (
  position: PositionEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', position);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects({ id: position.id });
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_POSITION_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
