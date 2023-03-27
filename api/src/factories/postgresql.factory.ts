import { Configuration } from '../modules/shared/constants/configuration.enum';
import { ConfigurationService } from '../modules/shared/services/configuration/configuration.service';

import entities from '../entities/index.entity';

export const postgresqlFactory = (
  configurationService: ConfigurationService,
) => ({
  type: configurationService.get(Configuration.POSTGRESQL_TYPE) as any,
  host: configurationService.get(Configuration.POSTGRESQL_HOST),
  port: parseInt(configurationService.get(Configuration.POSTGRESQL_PORT)),
  database: configurationService.get(Configuration.POSTGRESQL_DATABASE_NAME),
  username: configurationService.get(Configuration.POSTGRESQL_USERNAME),
  password: configurationService.get(Configuration.POSTGRESQL_PASSWORD),
  entities: entities,
  logging: configurationService.get(Configuration.LOGGING) as any,
  logger: configurationService.get(Configuration.LOGGER) as any,
  maxQueryExecutionTime: 3000,
  synchronize: false,
});
