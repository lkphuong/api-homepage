import {
  Controller,
  Delete,
  HttpException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import * as path from 'path';

import { sprintf } from '../../../utils';
import { unlinkFile, uploadFile } from '../funcs';

import { FileEntity } from '../../../entities/file.entity';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { HttpResponse } from '../../../interfaces/http_response.interface';
import { JwtPayload } from '../../auth/interfaces/payloads/jwt_payload.interface';

import { LogService } from '../../log/services/log.service';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { FilesService } from '../services/files.service';

import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { validateFile, validateFileId, validateFileSize } from '../validations';

@Controller('files')
export class FilesController {
  constructor(
    private readonly _configurationService: ConfigurationService,
    private readonly _dataSource: DataSource,
    private readonly _fileService: FilesService,
    private _logger: LogService,
  ) {}
  /**
   * @method POST
   * @url /api/files/upload
   * @access private
   * @param file
   * @returns HttpResponse<Pick<FileEntity, 'id' | 'originalName' | 'url' | 'extension'>> | HttpException
   * @description Upload a file
   * @page Files page
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFiles(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<
    | HttpResponse<
        Pick<FileEntity, 'id' | 'originalName' | 'url' | 'extension'>
      >
    | HttpException
  > {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(file));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(file),
      );

      //#region Validation
      //#region Validate file empty
      const valid_file = await validateFile(file, req);
      if (valid_file instanceof HttpException) throw valid_file;
      //#endregion
      //#region Validate file size
      const valid_size = await validateFileSize(
        this._configurationService,
        file,
        req,
      );
      if (valid_size instanceof HttpException) throw valid_size;
      //#endregion
      //#endregion

      const { originalname, filename, destination } = file;
      const extension = path.parse(originalname).ext;

      //#region Upload document
      const document = await uploadFile(
        destination,
        extension,
        filename,
        originalname,
        this._fileService,
        this._dataSource,
        req,
      );

      //#region Generate response
      if (document instanceof HttpException) throw document;
      else return document;
      //#endregion
      //#endregion
    } catch (err) {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + err.message);

      if (err instanceof HttpException) throw err;
      else {
        throw new HandlerException(
          SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
          req.method,
          req.url,
        );
      }
    }
  }

  /**
   * @method DELETE
   * @url /api/files/:id
   * @access private
   * @param id
   * @returns HttpResponse<Pick<DocumentEntity, 'id' | 'originalName' | 'url' | 'extension'>> | HttpException
   * @description Delete the file
   * @page Files page
   */
  @Delete(':id')
  @UsePipes(ValidationPipe)
  async unlinkFiles(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<
    | HttpResponse<
        Pick<FileEntity, 'id' | 'originalName' | 'url' | 'extension'>
      >
    | HttpException
  > {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url);
      console.log('file_id: ', id);

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify({ file_id: id }),
      );

      //#region Validate File ID
      const valid = validateFileId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      const { username: request_code } = req.user as JwtPayload;

      const file = await this._fileService.getFileById(id);
      if (file) {
        //#region Validation

        //#region Unlink file
        const response = await unlinkFile(
          request_code,
          file,
          this._configurationService,
          this._fileService,
          this._logger,
          this._dataSource,
          req,
        );

        //#region Generate response
        if (response instanceof HttpException) throw response;
        else return response;
        //#endregion
        //#endregion
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          id,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.FILE_NOT_FOUND_ERROR, id),
        );
        //#endregion
      }
    } catch (err) {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + err.message);

      if (err instanceof HttpException) throw err;
      else {
        throw new HandlerException(
          SERVER_EXIT_CODE.INTERNAL_SERVER_ERROR,
          req.method,
          req.url,
        );
      }
    }
  }
}
