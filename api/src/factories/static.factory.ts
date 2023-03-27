import { join } from 'path';

import { Configuration } from '../modules/shared/constants/configuration.enum';
import { ConfigurationService } from '../modules/shared/services/configuration/configuration.service';

export const staticFactory = (configurationService: ConfigurationService) => {
  const static_path = configurationService.get(Configuration.STATIC_PATH);

  return [
    {
      rootPath: join(__dirname, static_path),
      renderPath: '/',
      exclude: ['/api*'],
      serveStaticOptions: {
        cacheControl: true,
        extensions: configurationService.get(
          Configuration.EXTENSION_VALUES,
        ) as unknown as string[],
        index: false,
        lastModified: true,
        maxAge: 0,
      },
    },
  ];
};
