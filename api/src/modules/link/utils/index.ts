import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { QueryRunner } from 'typeorm';

import { returnObjects } from '../../../utils';

import { LinkLanguageEntity } from '../../../entities/link_language.entity';

import { generateData2Array } from '../transform';

import { HandlerException } from '../../../exceptions/HandlerException';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const generateResponse = async (
  links: LinkLanguageEntity[],
  query_runner: QueryRunner,
  req: Request,
) => {
  console.log('----------------------------------------------------------');
  console.log(req.method + ' - ' + req.url);
  console.log('data: ', links);

  // Transform LinkLanguageEntity class to ILinksResponse class
  const payload = generateData2Array(links);

  // Commit transaction
  if (query_runner) await query_runner.commitTransaction();

  return returnObjects(payload);
};

export const generateFailedResponse = (req: Request, message?: string) => {
  return new HandlerException(
    SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
    req.method,
    req.url,
    message ?? ErrorMessage.OPERATOR_LINKS_ERROR,
    HttpStatus.EXPECTATION_FAILED,
  );
};
