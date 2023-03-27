import { HttpException, HttpStatus } from '@nestjs/common';
import { isEmpty, isUUID } from 'class-validator';
import { Request } from 'express';

import { sprintf } from '../../../utils';

import { ConfigurationService } from '../../shared/services/configuration/configuration.service';

import { HandlerException } from '../../../exceptions/HandlerException';
import { InvalidFileSizeException } from '../../../exceptions/InvalidFileSizeException';

import {
  FILE_EXIT_CODE,
  VALIDATION_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

import { Configuration } from '../../shared/constants/configuration.enum';

export const validateFileId = (id: string, req: Request) => {
  if (isEmpty(id)) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.EMPTY,
      req.method,
      req.url,
      ErrorMessage.FILE_ID_EMPTY_ERROR,
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

export const validateFileSize = async (
  configuration_service: ConfigurationService,
  file: any,
  req: Request,
): Promise<HttpException | null> => {
  const max_file_size_label: string = configuration_service.get(
    Configuration.MAX_FILE_SIZE_NAME,
  ) as unknown as string;

  const max_file_size_value: number = configuration_service.get(
    Configuration.MAX_FILE_SIZE_VALUE,
  ) as unknown as number;

  if (file.size > max_file_size_value) {
    return new InvalidFileSizeException(
      FILE_EXIT_CODE.INVALID_SIZE,
      req.method,
      req.url,
      sprintf(
        ErrorMessage.FILE_SIZE_TOO_LARGE_ERROR,
        file.originalname,
        max_file_size_label,
      ),
      HttpStatus.BAD_REQUEST,
    );
  }

  return null;
};

export const validateFile = async (file: any, req: Request) => {
  if (!file) {
    return new HandlerException(
      VALIDATION_EXIT_CODE.EMPTY,
      req.method,
      req.url,
      ErrorMessage.FILE_EMPTY_ERROR,
      HttpStatus.BAD_REQUEST,
    );
  }

  return null;
};
