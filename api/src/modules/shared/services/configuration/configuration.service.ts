import { Injectable } from '@nestjs/common';
import * as config from 'config';

@Injectable()
export class ConfigurationService {
  private environment: string = process.env.NODE_ENV || 'development';

  get(name: string): string {
    console.log(name, ': ', process.env[name] || config.get(name));
    return process.env[name] || config.get(name);
  }

  get isDevelopment(): boolean {
    const result = this.environment == 'development';
    return result;
  }
}
