import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSource } from 'typeorm';

import {
  generateArraySuccessResponse,
  generateSuccessResponse,
} from '../utils';
import { sprintf } from '../../../utils';

import { validateLanguageId, validateEmployeeId } from '../validations';

import { createEmployee, updateEmployee, deleteEmployee } from '../funcs';

import { CreateEmployeeDto } from '../dtos/create_employee.dto';
import { GetEmployeePagingDto } from '../dtos/get_employee_paging.dto';
import { UpdateEmployeeDto } from '../dtos/update_employee.dto';

import { HandlerException } from '../../../exceptions/HandlerException';
import { UnknownException } from '../../../exceptions/UnknownException';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

import { FilesService } from '../../file/services/files.service';
import { LogService } from '../../log/services/log.service';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { EmployeeService } from '../services/employee/employee.service';
import { EmployeeLanguageService } from '../services/employee-language/employee_language.service';

import {
  EmployeeLanguageResponse,
  DeleteEmployeeResponse,
  EmployeePagingResponse,
} from '../interfaces/employee_response.interface';
import { HttpPagingResponse } from '../../../interfaces/http_paging_response.interface';
import { HttpResponse } from '../../../interfaces/http_response.interface';

import {
  DATABASE_EXIT_CODE,
  SERVER_EXIT_CODE,
} from '../../../constants/enums/error_code.enum';
import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

@Controller('employees')
export class EmployeeController {
  constructor(
    private _logger: LogService,
    private readonly _dataSource: DataSource,
    private readonly _employeeService: EmployeeService,
    private readonly _employeeLanguageService: EmployeeLanguageService,
    private readonly _configurationService: ConfigurationService,
    private readonly _fileService: FilesService,
  ) {}

  /**
   * @method GET
   * @url api/employees/:id/?language_id=
   * @param id
   * @return HttpResponse<EmployeeLanguageResponse> | HttpException
   * @description
   * @page
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getemployeeById(
    @Param('id') id: string,
    @Query('language_id') language_id: string,
    @Req() req: Request,
  ): Promise<HttpResponse<EmployeeLanguageResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(
        req.method + ' - ' + req.url + ': ' + JSON.stringify({ id: id }),
      );

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify({ id: id }),
      );

      //#region Validation
      //#region Validate employee id
      let valid = validateEmployeeId(id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion

      //#region Validate language id
      valid = validateLanguageId(language_id, req);
      if (valid instanceof HttpException) throw valid;
      //#endregion
      //#endregion

      const employee_language =
        await this._employeeLanguageService.getEmployeeLanguageById(
          id,
          language_id,
        );

      if (employee_language) {
        //#region generate response
        return await generateSuccessResponse(employee_language, null, req);
        //#endregion
      } else {
        //#region throw HandlerException
        throw new UnknownException(
          id,
          DATABASE_EXIT_CODE.UNKNOW_VALUE,
          req.method,
          req.url,
          sprintf(ErrorMessage.EMPLOYEE_NOT_FOUND_ERROR, id),
        );
        //#endregion
      }
    } catch (err) {
      console.log(err);
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
   * @method POST
   * @url api/employees/:id
   * @param id
   * @return HttpResponse<EmployeePagingResponse> | HttpException
   * @description
   * @page
   */
  @Post('all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getemployeePaging(
    @Body() params: GetEmployeePagingDto,
    @Req() req: Request,
  ): Promise<HttpPagingResponse<EmployeePagingResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + '');

      this._logger.writeLog(Levels.LOG, req.method, req.url, null);

      //#region Get parrams
      const { language_id, page, input } = params;
      let { pages } = params;

      const itemsPerPage = parseInt(
        this._configurationService.get(Configuration.ITEMS_PER_PAGE),
      );
      //#endregion

      //#region Get pages
      if (pages === 0) {
        const count = await this._employeeService.count(language_id, input);
        console.log('count: ', count);
        if (count > 0) pages = Math.ceil(count / itemsPerPage);
      }
      //#endregion

      //#region get employees
      const employees = await this._employeeService.getEmployeePaging(
        (page - 1) * itemsPerPage,
        itemsPerPage,
        language_id,
        input,
      );
      //#endregion
      if (employees && employees.length > 0) {
        //#region generate response
        return await generateArraySuccessResponse(pages, page, employees, req);
        //#endregion
      } else {
        //#region throw HandlerException
        throw new HandlerException(
          DATABASE_EXIT_CODE.NO_CONTENT,
          req.method,
          req.url,
          ErrorMessage.NO_CONTENT,
          HttpStatus.NOT_FOUND,
        );
        //#endregion
      }
    } catch (err) {
      console.log(err);
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
   * @method POST
   * @url api/employees/
   * @param id
   * @return HttpResponse<EmployeeLanguageResponse> | HttpException
   * @description
   * @page
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() params: CreateEmployeeDto,
    @Req() req: Request,
  ): Promise<HttpResponse<EmployeeLanguageResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const employee = await createEmployee(
        params,
        this._employeeService,
        this._employeeLanguageService,
        this._fileService,
        this._dataSource,
        req,
      );
      if (employee instanceof HttpException) throw employee;
      else return employee;
    } catch (err) {
      console.log(err);
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
   * @method PUT
   * @url api/employees/:id
   * @param id
   * @return HttpResponse<EmployeeLanguageResponse> | HttpException
   * @description
   * @page
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string,
    @Body() params: UpdateEmployeeDto,
    @Req() req: Request,
  ): Promise<HttpResponse<EmployeeLanguageResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(req.method + ' - ' + req.url + ': ' + JSON.stringify(params));

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify(params),
      );

      const employee = await updateEmployee(
        id,
        params,
        this._employeeService,
        this._employeeLanguageService,
        this._fileService,
        this._dataSource,
        req,
      );
      if (employee instanceof HttpException) throw employee;
      else return employee;
    } catch (err) {
      console.log(err);
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
   * @url api/employees/:id
   * @param id
   * @return HttpResponse<EmployeeLanguageResponse> | HttpException
   * @description
   * @page
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async unlink(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<HttpResponse<DeleteEmployeeResponse> | HttpException> {
    try {
      console.log('----------------------------------------------------------');
      console.log(
        req.method + ' - ' + req.url + ': ' + JSON.stringify({ id: id }),
      );

      this._logger.writeLog(
        Levels.LOG,
        req.method,
        req.url,
        JSON.stringify({ id: id }),
      );

      //#region delete employee
      const result = await deleteEmployee(
        id,
        this._employeeService,
        this._employeeLanguageService,
        this._dataSource,
        req,
      );
      if (result instanceof HttpException) throw result;
      else return result;
      //#endregion
    } catch (err) {
      console.log(err);
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
