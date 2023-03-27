import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { ConfigurationService } from '../../shared/services/configuration/configuration.service';
import { Configuration } from '../../shared/constants/configuration.enum';
import { JwtPayload } from '../interfaces/payloads/jwt_payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly _configurationService: ConfigurationService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: _configurationService.get(Configuration.ACCESS_SECRET_KEY),
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
