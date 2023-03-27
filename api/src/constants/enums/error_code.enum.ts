export enum ErrorCode {
  Error_1001 = 1001, // No token
  Error_1002 = 1002, // Invalid token
  Error_1003 = 1003, // Token expired

  Error_2001 = 2001, // Access denied

  Error_3001 = 3001, // Missing values
  Error_3002 = 3002, // Invalid format
  Error_3003 = 3003, // Unique value
  Error_3004 = 3004, // Invalid length
  Error_3005 = 3005, // Text contains invalid charactor

  Error_4001 = 4001, // Cannot connect to database
  Error_4002 = 4002, // Unauthorize
  Error_4003 = 4003, // Timeout
  Error_4004 = 4004, // Operator error
  Error_4005 = 4005, // Lost conenction
  Error_4006 = 4006, // Unique field value
  Error_4007 = 4007, // Unknown value
  Error_4008 = 4008, // No content

  Error_5001 = 5001, // Invalid extention
  Error_5002 = 5002, // Invalid size
  Error_5003 = 5003, // Invalid name
  Error_5004 = 5004, // Maximum {n} files
  Error_5005 = 5005, // Full disk
  Error_5006 = 5006, // Permission error

  Error_6001 = 6001, // Internal server

  Error_9001 = 9001, // Unknown error
}

export enum AUTHENTICATION_EXIT_CODE {
  NO_TOKEN = 1001,
  INVALID_TOKEN = 1002,
  EXPIRED_TOKEN = 1003,
}

export enum AUTHORIZATION_EXIT_CODE {
  ACCESS_DENIED = 2001,
}

export enum VALIDATION_EXIT_CODE {
  EMPTY = 3001,
  INVALID_FORMAT = 3002,
  UNIQUE_VALUE = 3003,
  INVALID_LENGTH = 3004,
  INVALID_CHARACTOR = 3005,
  NOT_FOUND = 3006,
  NO_MATCHING = 3007,
  INVALID_VALUE = 3008,
}

export enum DATABASE_EXIT_CODE {
  CANNOT_CONNECT = 4001,
  UNAUTHORIZE = 4002,
  TIMEOUT = 4003,
  OPERATOR_ERROR = 4004,
  LOST_CONNECT = 4005,
  UNIQUE_FIELD_VALUE = 4006,
  UNKNOW_VALUE = 4007,
  NO_CONTENT = 4008,
}

export enum FILE_EXIT_CODE {
  INVALID_EXTENSION = 5001,
  INVALID_SIZE = 5002,
  INVALID_NAME = 5003,
  MAXIMUM_FILE = 5004,
  FULL_DISK = 5005,
  PERMISSION_ERROR = 5006,
}

export enum SERVER_EXIT_CODE {
  INTERNAL_SERVER_ERROR = 6001,
}

export enum UNKNOW_EXIT_CODE {
  UNKNOW_ERROR = 9001,
}
