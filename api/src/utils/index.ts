/* eslint-disable @typescript-eslint/no-unused-vars */
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ValidationArguments } from 'class-validator';
import { Request } from 'express';
import slugify from 'slugify';

import * as dayjs from 'dayjs';
import * as fs from 'fs-extra';

import { ConfigurationService } from '../modules/shared/services/configuration/configuration.service';
import { LogService } from '../modules/log/services/log.service';

import { VerifyTokenMiddleware } from '../modules/auth/middlewares/auth.middleware';

import { HttpPagingResponse } from '../interfaces/http_paging_response.interface';
import { HttpResponse } from '../interfaces/http_response.interface';

import { UPLOAD_DEST } from '../constants';
import { Configuration } from '../modules/shared/constants/configuration.enum';
import { Levels } from '../constants/enums/level.enum';

export const applyMiddlewares = (consumer: MiddlewareConsumer) => {
  consumer
    .apply(VerifyTokenMiddleware)
    .exclude(
      { path: '/api/auth/login', method: RequestMethod.POST },
      { path: '/api/auth/renew-token', method: RequestMethod.POST },
      'uploads/(.*)',
    )
    .forRoutes({ path: '*', method: RequestMethod.ALL });
};

export const _slugify = (raw: string) => {
  raw = slugify(raw, {
    remove: /[*+~.()'"!:@]/g,
    trim: true,
    locale: 'vi',
    lower: true,
  });
  return raw;
};

export const convertTz = (
  date: any = new Date(),
  _timeZone = 'Asia/Ho_Chi_Minh',
): Date => {
  const current = typeof date === 'string' ? new Date(date) : date;

  return current;

  // return new Date(current.toLocaleString('en-US', { timeZone }));
};

export const toDateString = (format = 'YYYY-MM-DD', date: Date = new Date()) =>
  dayjs(convertTz(date, 'Asia/Ho_Chi_Minh')).format(format);

export const removeDuplicates = <T>(data: T[]) => {
  return Array.from(new Set(data));
};

export const removeDuplicatesObject = <T>(data: T[], key: string) => {
  return [...new Map(data.map((i) => [i[key], i])).values()];
};

export const removeFile = (
  url,
  configuration_service: ConfigurationService,
  log_service: LogService,
  req: Request,
) => {
  const root = configuration_service.get(Configuration.MULTER_DEST);

  url = url.replace(UPLOAD_DEST, root);
  fs.unlink(url, (err) => {
    if (err) {
      log_service.writeLog(Levels.ERROR, req.method, req.url, err.message);
    }
  });
};

export const generateValidationMessage = (
  arg: ValidationArguments,
  message: string,
): string => JSON.stringify({ [arg.property]: message });

export const returnObjects = <T>(
  data: T | T[] | null,
  errorCode?: number,
  message?: string | null,
  errors?: [{ [key: string]: string }] | null,
): HttpResponse<T> => {
  return {
    data: data,
    errorCode: data != null ? 0 : errorCode ?? 0,
    message: data !== null ? null : message,
    errors: errors ?? null,
  };
};

export const returnObjectsWithPaging = <T>(
  pages: number,
  page: number,
  data: T | T[] | null,
  count?: number,
  errorCode?: number,
  message?: string | null,
  errors?: [{ [key: string]: string }] | null,
): HttpPagingResponse<T> => {
  return {
    data: {
      pages,
      page,
      data,
      count,
    },
    errorCode: data != null ? 0 : errorCode ?? 9001,
    message: data !== null ? null : message,
    errors: errors ?? null,
  };
};

export const sprintf = (str, ...argv) =>
  !argv.length
    ? str
    : sprintf((str = str.replace('%s' || '$', argv.shift())), ...argv);

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
export const hashFnv32a = (
  data: string,
  length = 10,
  toString = true,
  seed?: number,
) => {
  /*jshint bitwise:false */
  let i = 0;
  const l = data.length;
  let hval = seed === undefined ? 0x811c9dc5 : seed;

  for (i = 0; i < l; i++) {
    hval ^= data.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }

  if (toString) {
    // Convert to 8 digit hex string
    return (hval >>> 0).toString(length);
  }

  return hval >>> 0;
};
