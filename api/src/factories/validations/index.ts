import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

import * as path from 'path';

import { sprintf } from '../../utils';

import { Configuration } from '../../modules/shared/constants/configuration.enum';
import { ConfigurationService } from '../../modules/shared/services/configuration/configuration.service';

import { ErrorMessage } from '../../constants/enums/errors.enum';

import { InvalidFileExtensionException } from '../../exceptions/InvalidFileExtensionException';
import { InvalidFileNameException } from '../../exceptions/InvalidFileNameException';
import { InvalidFileSizeException } from '../../exceptions/InvalidFileSizeException';

import { FILE_EXIT_CODE } from '../../constants/enums/error_code.enum';
import { SPECIAL_ALPHABEL_REGEX, NORMAL_ALPHABEL_REGEX } from '../../constants';

export const validateFileExtension = async (
  configuration_service: ConfigurationService,
  file: any,
  req: Request,
): Promise<HttpException | null> => {
  const extensions: string[] = configuration_service.get(
    Configuration.EXTENSION_VALUES,
  ) as unknown as string[];

  const labels = configuration_service.get(Configuration.EXTENSION_NAMES);

  if (!extensions.includes(file.mimetype)) {
    return new InvalidFileExtensionException(
      FILE_EXIT_CODE.INVALID_EXTENSION,
      req.method,
      req.url,
      sprintf(
        ErrorMessage.FILE_EXTENSION_INVALID_ERROR,
        file.originalname,
        labels,
      ),
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

export const validateFileName = async (
  file: any,
  req: Request,
): Promise<HttpException | null> => {
  const reg = SPECIAL_ALPHABEL_REGEX;
  const normal_reg = NORMAL_ALPHABEL_REGEX;
  const basename = path.parse(file.originalname).name;
  const invalid = reg.test(basename);
  const invalid_normal = normal_reg.test(basename);

  if (!invalid) {
    if (!invalid_normal) {
      return new InvalidFileNameException(
        FILE_EXIT_CODE.INVALID_NAME,
        req.method,
        req.url,
        sprintf(ErrorMessage.FILE_NAME_INVALID_ERROR, file.originalname),
        HttpStatus.BAD_REQUEST,
      );
    }
  } else {
    return new InvalidFileNameException(
      FILE_EXIT_CODE.INVALID_NAME,
      req.method,
      req.url,
      sprintf(ErrorMessage.FILE_NAME_INVALID_ERROR, file.originalname),
      HttpStatus.BAD_REQUEST,
    );
  }

  return null;
};
