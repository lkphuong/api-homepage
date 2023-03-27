export default {
  POSTGRESQL_TYPE: 'postgres',
  POSTGRESQL_HOST: '115.79.199.129',
  // POSTGRESQL_HOST: '192.168.1.9',
  POSTGRESQL_PORT: 5432,
  POSTGRESQL_DATABASE_NAME: 'hcmue_db',
  POSTGRESQL_USERNAME: 'hcmue_user',
  POSTGRESQL_PASSWORD: 'hcmue!@#',

  LOGGING: ['query', 'error', 'info', 'warn'],
  LOGGER: 'file',

  ACCESS_SECRET_KEY: 'hcmue-homepage@2023',
  REFRESH_SECRET_KEY: '@dm1nSp@ce123',
  ACCESS_TOKEN_EXPIRESIN: '1d',
  REFRESH_TOKEN_EXPIRESIN: '30 days',
  ITEMS_PER_PAGE: 10,

  BASE_URL: 'http://103.154.176.80:3020/uploads/',

  SALT: '10',

  MAX_FILE_SIZE_NAME: '10MiB',
  MAX_FILE_SIZE_VALUE: 10 * 1024 * 1024,
  MAX_FIELD_SIZE_VALUE: 1 * 1024 * 1024,
  EXTENSION_NAMES: 'pdf, jpg, jpeg, png',
  EXTENSION_VALUES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],

  STATIC_PATH: './static/uploads',
  MULTER_DEST: './static/uploads',
};
