import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UsersEntity } from '../users/entities/users.entity';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import Utils from 'src/utils';
import { RolesEnum } from 'src/enums/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {
    this.seedAdmin();
  }

  private async seedAdmin() {
    const admin = await this.usersService.findOneAndOnlyAdmin();

    if (!admin) {
      const { login, password } = Utils.Constants.ADMIN_USER_CREDENTIALS;

      await this.usersService.createUser(
        login,
        password,
        'AdminORG',
        RolesEnum.ADMIN,
      );

      console.log('Basic admin created!');
    }
  }

  async registerUser({
    login,
    password,
    organizationTitle,
  }: RegisterUserDto): Promise<UsersEntity | undefined> {
    return await this.usersService.createUser(
      login,
      password,
      organizationTitle,
    );
  }

  async loginUser({ login, password }: LoginUserDto) {
    const userToLogin = await this.usersService.loginUser(login, password);

    if (userToLogin) {
      const payload = {
        id: userToLogin.id,
        login: userToLogin.login,
        role: userToLogin.role,
      };

      return {
        role: payload.role,
        accessToken: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }),
      };
    } else {
      throw new HttpException(
        `Нет такого пользователя! :: ${login}`,
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async validateUser(login: string, password: string): Promise<any> {
    const passwordHash = Utils.Crypto.hashify(password);
    const user = await this.usersService.findOneByLogin(login);
    if (passwordHash === user.passwordHash) {
      const { ...result } = user;
      return result;
    }
    return null;
  }
}
