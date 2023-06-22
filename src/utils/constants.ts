import { DataUnitsEnum } from 'src/enums/data-units.enum';

export const Constants = {
  MAX_FILE_SIZE: 12 * DataUnitsEnum.MB,
  FILE_UPLOAD_DESTINATION: process.env.FILE_UPLOAD_DESTINATION,
  API_URL: process.env.API_URL,
  ADMIN_USER_CREDENTIALS: {
    login: process.env.ADMIN_LOGIN,
    password: process.env.ADMIN_PASSWORD,
  },
  GAME_FEATURES_LIMITS: {
    min: 0,
    max: 100,
  },
};
