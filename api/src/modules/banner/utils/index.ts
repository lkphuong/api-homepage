import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';

import { returnObjects, returnObjectsWithPaging } from '../../../utils';

import { BannerEntity } from '../../../entities/banner.entity';
import { BannerLanguageEntity } from '../../../entities/banner_language.entity';

import { generateData2Array, generateData2Object } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { BannerResponse } from '../interfaces/banner_response.interface';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const generateArraySuccessResponse = async (
  pages: number,
  page: number,
  users: BannerEntity[],
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);

  // Transform UserEntity class to BannerResponse class
  const payload = generateData2Array(users);

  return returnObjectsWithPaging<BannerResponse>(pages, page, payload);
};

export const generateSuccessResponse = async (
  banner_language: BannerLanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', banner_language);

  // Transform UserEntity class to BannerResponse class
  const payload = generateData2Object(banner_language);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateDeleteSuccessResponse = async (
  banner: BannerEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', banner);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects({ id: banner.id });
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_BANNER_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
