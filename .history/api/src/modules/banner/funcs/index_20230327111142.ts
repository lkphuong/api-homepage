import { HttpException } from '@nestjs/common';
import { Request } from 'express';
import { DataSource, QueryRunner } from 'typeorm';

import {
  generateDeleteSuccessResponse,
  generateFailedResponse,
  generateSuccessResponse,
} from '../utils';
import { _slugify } from '../../../utils';

import {
  validateBanner,
  validateBannerId,
  validateFile,
  validateTime,
} from '../validations';

import { BannerEntity } from '../../../entities/banner.entity';
import { BannerLanguageEntity } from '../../../entities/banner_language.entity';
import { FileEntity } from '../../../entities/file.entity';

import { CreateBannerDto } from '../dtos/create_banner.dto';
import { UpdateBannerDto } from '../dtos/update_banner.dto';

import { BannerService } from '../services/banner/banner.service';
import { FilesService } from '../../file/services/files.service';
import { BannerLanguageService } from '../services/banner-language/banner_language.service';

import { HandlerException } from '../../../exceptions/HandlerException';

import { SERVER_EXIT_CODE } from '../../../constants/enums/error_code.enum';

export const createBanner = async (
  params: CreateBannerDto,
  banner_service: BannerService,
  banner_language_service: BannerLanguageService,
  file_service: FilesService,
  data_source: DataSource,
  req: Request,
) => {
  const { file_id } = params;
  //#region validate file
  const file = await validateFile(file_id, file_service, req);
  if (file instanceof HttpException) throw file;
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region Create banner
    const banner = await addBanner(params, banner_service, query_runner);
    if (banner) {
      //#region create banner language
      const banner_language = await addBannerLanguage(
        params,
        banner,
        file,
        banner_language_service,
        file_service,
        query_runner,
      );
      if (banner_language) {
        //#region generate response
        return await generateSuccessResponse(
          banner_language,
          query_runner,
          req,
        );
        //#endregion
      }
      //#endregion
    }
    //#endregion

    throw generateFailedResponse(req);
  } catch (err) {
    // Rollback transaction
    await query_runner.rollbackTransaction();

    console.log('--------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + err.message);

    if (err instanceof HttpException) return err;
    else {
      //#region throw HandlerException
      return new HandlerException(
        SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
        req.method,
        req.url,
      );
      //#endregion
    }
  } finally {
    // Release transaction
    await query_runner.release();
  }
};

export const updateBanner = async (
  banner_id: string,
  params: UpdateBannerDto,
  banner_service: BannerService,
  banner_language_service: BannerLanguageService,
  file_service: FilesService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Get params
  const { start_date, end_date, file_id } = params;
  //#endregion

  //#region Validation
  //#region Validate time
  const valid = validateTime(start_date, end_date, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion
  //#region Validate banner
  const banner = await validateBanner(banner_id, banner_service, req);
  if (banner instanceof HttpException) throw banner;
  //#endregion
  //#region Validate file
  const file = await validateFile(file_id, file_service, req);
  if (file instanceof HttpException) throw file;
  //#endregion
  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();

    //#region update banner
    const banner = await editBanner(
      banner_id,
      params,
      banner_service,
      query_runner,
    );

    if (banner) {
      //#region Update banner language
      const banner_language = await editBannerLanguage(
        banner_id,
        banner,
        file,
        params,
        banner_language_service,
        file_service,
        query_runner,
      );

      if (banner_language) {
        //#region generate response
        return await generateSuccessResponse(
          banner_language,
          query_runner,
          req,
        );
        //#endregion
      }
      //#endregion
    }

    throw generateFailedResponse(req);
    //#endregion
  } catch (err) {
    // Rollback transaction
    await query_runner.rollbackTransaction();

    console.log('--------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + err.message);

    if (err instanceof HttpException) return err;
    else {
      //#region throw HandlerException
      return new HandlerException(
        SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
        req.method,
        req.url,
      );
      //#endregion
    }
  } finally {
    // Release transaction
    await query_runner.release();
  }
};

export const deleteBanner = async (
  banner_id: string,
  banner_service: BannerService,
  banner_language_service: BannerLanguageService,
  data_source: DataSource,
  req: Request,
) => {
  //#region Validation
  //#region validate banner id
  const valid = validateBannerId(banner_id, req);
  if (valid instanceof HttpException) throw valid;
  //#endregion

  //#region validate banner
  const banner = await validateBanner(banner_id, banner_service, req);
  if (banner instanceof HttpException) throw banner;
  //#endregion

  //#endregion

  // Make the QueryRunner
  const query_runner = data_source.createQueryRunner();
  await query_runner.connect();

  try {
    // Start transaction
    await query_runner.startTransaction();
    //#endregion

    //#region delete banner
    const delete_banner = await banner_service.unlink(
      banner_id,
      query_runner.manager,
    );
    if (delete_banner) {
      const delete_banner_language = await banner_language_service.bulkUnlink(
        banner_id,
        query_runner.manager,
      );

      if (delete_banner_language) {
        //#region generate response
        return await generateDeleteSuccessResponse(banner, query_runner, req);
        //#endregion
      }
    }

    throw generateFailedResponse(req);
    //#endregion
  } catch (err) {
    // Rollback transaction
    await query_runner.rollbackTransaction();

    console.log('--------------------------------------------------------');
    console.log(req.method + ' - ' + req.url + ': ' + err.message);

    if (err instanceof HttpException) return err;
    else {
      //#region throw HandlerException
      return new HandlerException(
        SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
        req.method,
        req.url,
      );
      //#endregion
    }
  } finally {
    // Release transaction
    await query_runner.release();
  }
};

export const addBanner = async (
  params: CreateBannerDto,
  banner_service: BannerService,
  query_runner: QueryRunner,
) => {
  const { start_date, end_date, published } = params;

  let banner = new BannerEntity();
  banner.start_date = new Date(start_date);
  banner.end_date = new Date(end_date);
  banner.published = published;

  banner = await banner_service.add(banner, query_runner.manager);

  return banner;
};

export const addBannerLanguage = async (
  params: CreateBannerDto,
  banner: BannerEntity,
  file: FileEntity,
  banner_language_service: BannerLanguageService,
  file_service: FilesService,
  query_runner: QueryRunner,
) => {
  const { title, language_id } = params;

  let banner_language = new BannerLanguageEntity();
  banner_language.banner = banner;
  banner_language.title = title;
  banner_language.slug = _slugify(title);
  banner_language.file_id = file.id;
  banner_language.language_id = language_id;

  //#region update file
  file.drafted = false;
  file.updated_at = new Date();
  file.updated_by = 'system';
  file = await file_service.update(file, query_runner.manager);
  //#endregion

  banner_language = await banner_language_service.add(
    banner_language,
    query_runner.manager,
  );

  return banner_language;
};

export const editBanner = async (
  banner_id: string,
  params: UpdateBannerDto,
  banner_service: BannerService,
  query_runner: QueryRunner,
) => {
  const { start_date, end_date, published } = params;
  let banner = await banner_service.getBannerById(banner_id);

  banner.start_date = new Date(start_date);
  banner.end_date = new Date(end_date);
  banner.published = published;

  banner = await banner_service.update(banner, query_runner.manager);

  return banner;
};

export const editBannerLanguage = async (
  banner_id: string,
  banner: BannerEntity,
  file: FileEntity,
  params: UpdateBannerDto,
  banner_language_service: BannerLanguageService,
  file_service: FilesService,
  query_runner: QueryRunner,
) => {
  const { language_id, title, deleted } = params;

  let update_files: FileEntity[] = [];

  let banner_language = await banner_language_service.contains(
    banner_id,
    language_id,
  );
  if (banner_language) {
    //#region edit or delete
    if (deleted) {
      //#region delete
      banner_language.deleted = true;
      banner_language.deleted_at = new Date();
      banner_language.deleted_by = 'system';
      //#endregion

      //#region delete file
      file.drafted = true;
      file.deleted = true;
      file.deleted_at = new Date();
      file.deleted_by = 'system';
      //#endregion
    } else {
      //#region edit
      banner_language.title = title;
      banner_language.slug = _slugify(title);
      banner_language.file_id = file.id;
      banner_language.updated_at = new Date();
      banner_language.updated_by = 'system';
      //#endregion

      //#region update file
      if (file.id != banner_language.file_id) {
        //#region delete old file
        const old_file = banner_language.file;
        old_file.drafted = true;
        old_file.deleted = true;
        old_file.deleted_at = new Date();
        old_file.deleted_by = 'system';
        //#endregion

        //#region update new file
        file.drafted = false;
        file.updated_at = new Date();
        file.updated_by = 'system';
        //#endregion

        update_files.push(old_file, file);
      }
      //#endregion
    }
    update_files = await file_service.bulkUpdate(
      update_files,
      query_runner.manager,
    );

    banner_language = await banner_language_service.update(
      banner_language,
      query_runner.manager,
    );

    return banner_language;
    //#endregion
  } else {
    //#region add banner language
    let new_banner_language = new BannerLanguageEntity();
    new_banner_language.title = title;
    new_banner_language.slug = _slugify(title);
    new_banner_language.banner = banner;
    new_banner_language.file_id = file.id;
    new_banner_language.language_id = language_id;

    new_banner_language = await banner_language_service.add(
      new_banner_language,
      query_runner.manager,
    );

    //#region update new file
    file.drafted = false;
    file.updated_at = new Date();
    file.updated_by = 'system';
    //#endregion

    await file_service.update(file, query_runner.manager);

    return new_banner_language;
    //#endregion
  }
};
