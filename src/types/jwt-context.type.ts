import { RolesEnum } from 'src/enums/roles.enum';

export type JwtContextType = {
  id: string;
  login: string;
  role: RolesEnum;
};
