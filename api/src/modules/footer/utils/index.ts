import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';

import { returnObjects } from '../../../utils';

import { generateData2Object } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';
import { FooterLanguageEntity } from '../../../entities/footer_language.entity';

export const generateSuccessResponse = async (
  footer_language: FooterLanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', footer_language);

  // Transform UserEntity class to EventResponse class
  const payload = generateData2Object(footer_language);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateDeleteSuccessResponse = async (
  footer: FooterLanguageEntity,
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', footer);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects({ id: footer.id });
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_FOOTER_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
