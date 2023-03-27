import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

import { Configuration } from '../../shared/constants/configuration.enum';
import { Levels } from '../../../constants/enums/level.enum';

import { JwtPayload } from '../interfaces/payloads/jwt_payload.interface';

import { AuthService } from '../services/auth.service';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { LogService } from '../../log/services/log.service';

import { HandlerException } from '../../../exceptions/HandlerException';

import { InvalidTokenException } from '../exceptions/InvalidTokenException';
import { NoTokenException } from '../exceptions/NoTokenException';
import { ExpiredTokenException } from '../exceptions/ExpiredTokenException';

@Injectable()
export class VerifyTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly _authService: AuthService,
    private readonly _configurationService: ConfigurationService,
    private readonly _jwtService: JwtService,
    private readonly _logger: LogService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let access_token = null;
    console.log('_path: ', req.path);

    try {
      const authorization = req.headers['authorization'];
      if (authorization) {
        access_token = authorization.split(' ')[1];
        if (access_token) {
          if (access_token) {
            //#region Decode token
            const decoded = this._jwtService.verify(access_token, {
              secret: this._configurationService.get(
                Configuration.ACCESS_SECRET_KEY,
              ),
            });
            //#endregion

            //#region Expired Token
            if (Date.now() >= decoded.exp * 1000) {
              throw new ExpiredTokenException(
                access_token,
                1003,
                req.method,
                req.url,
              );
            }

            req.user = decoded as JwtPayload;

            const auth = await this._authService.contains(decoded.username);

            if (!auth.access_token) {
              throw new ExpiredTokenException(
                access_token,
                1003,
                req.method,
                req.url,
              );
            }
            //#endregion
            next();
          } else {
            //#region Invalid Token
            this._logger.writeLog(
              Levels.ERROR,
              req.method,
              req.url,
              `Invalid Token (access_token: ${access_token})`,
            );

            throw new InvalidTokenException(
              access_token,
              1002,
              req.method,
              req.url,
            );
            //#endregion
          }
        } else {
          this._logger.writeLog(Levels.ERROR, req.method, req.url, 'No Token');
          throw new NoTokenException(1001, req.method, req.url);
        }
      } else {
        this._logger.writeLog(Levels.ERROR, req.method, req.url, 'No Token');
        throw new NoTokenException(1001, req.method, req.url);
      }
    } catch (err) {
      this._logger.writeLog(Levels.ERROR, req.method, req.url, err.message);

      if (err instanceof HttpException) throw err;
      else if (access_token)
        throw new ExpiredTokenException(
          access_token,
          1003,
          req.method,
          req.url,
        );
      else throw new HandlerException(6001, req.method, req.url);
    }
  }
}
