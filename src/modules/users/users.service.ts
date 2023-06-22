import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { MoreThan, Not, Repository } from 'typeorm';
import Utils from 'src/utils';
import { RolesEnum } from 'src/enums/roles.enum';
import { JwtContextType } from 'src/types/jwt-context.type';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async getMe(context: JwtContextType) {
    return await this.usersRepository.findOne({
      where: { id: context.id },
      relations: { sessions: true },
    });
  }

  async deleteUser(context: JwtContextType, userId: string) {
    if (
      context.id === userId ||
      (context.role === RolesEnum.ADMIN.toString() && context.id !== userId)
    ) {
      return await this.usersRepository.delete(userId);
    } else {
      throw new HttpException(
        `Update privelege violation!`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async getRecords() {
    return await this.usersRepository.find({
      where: { role: RolesEnum.COMMON, maxScoreRecord: MoreThan(0) },
      order: { maxScoreRecord: 'DESC' },
    });
  }

  async updateUser(
    context: JwtContextType,
    userId: string,
    { login, password, organizationTitle }: UpdateUserDTO,
  ) {
    const candidate = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!candidate) {
      throw new HttpException(
        `Нет пользователя с таким Id :: ${userId}`,
        HttpStatus.CONFLICT,
      );
    }

    await this.usersRepository.update(userId, {
      ...(login && { login: login }),
      ...(password && { passwordHash: Utils.Crypto.hashify(password) }),
      ...(organizationTitle && { organizationTitle: organizationTitle }),
    });

    return await this.usersRepository.findOne({ where: { id: userId } });
  }

  async findOneAndOnlyAdmin() {
    return await this.usersRepository.findOne({
      where: { role: RolesEnum.ADMIN },
    });
  }

  async findOneByLogin(login: string): Promise<UsersEntity | undefined> {
    return await this.usersRepository.findOne({ where: { login: login } });
  }

  async findOneById(userId: string): Promise<UsersEntity | undefined> {
    return await this.usersRepository.findOne({ where: { id: userId } });
  }

  async createUser(
    login: string,
    password: string,
    organizationTitle: string,
    role: RolesEnum = RolesEnum.COMMON,
  ): Promise<UsersEntity | undefined> {
    const candidate = await this.usersRepository.findOne({
      where: { login: login },
    });

    if (candidate) {
      throw new HttpException(
        'Такой пользователь уже есть!',
        HttpStatus.CONFLICT,
      );
    }

    const newUser = this.usersRepository.create({
      login,
      passwordHash: Utils.Crypto.hashify(password),
      role: role,
      organizationTitle: organizationTitle,
    });

    return await this.usersRepository.save(newUser);
  }

  async loginUser(
    login: string,
    password: string,
  ): Promise<UsersEntity | undefined> {
    return await this.usersRepository.findOne({
      where: {
        login,
        passwordHash: Utils.Crypto.hashify(password),
      },
    });
  }

  async setHighScore(userId: string, score: number) {
    await this.usersRepository.update(userId, { maxScoreRecord: score });
  }

  async getUsers(context: JwtContextType) {
    return await this.usersRepository.find({
      where: { role: Not(RolesEnum.ADMIN) },
    });
  }
}
