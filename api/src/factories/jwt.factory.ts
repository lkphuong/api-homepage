import { Configuration } from '../modules/shared/constants/configuration.enum';
import { ConfigurationService } from '../modules/shared/services/configuration/configuration.service';

export const jwtFactory = (configurationService: ConfigurationService) => ({
  secret: configurationService.get(Configuration.ACCESS_SECRET_KEY),
  signOptions: {
    expiresIn: '60s',
  },
});
