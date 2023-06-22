import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RolesEnum } from 'src/enums/roles.enum';
import { JwtContextType } from 'src/types/jwt-context.type';
import { ExtractJwtContext } from '../auth/decorators/jwt.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @UseGuards(new JwtAuthGuard())
  @Get('/me')
  getMe(@ExtractJwtContext() context: JwtContextType) {
    return this.usersService.getMe(context);
  }

  @UseGuards(new JwtAuthGuard())
  @Get('/')
  getUsers(@ExtractJwtContext() context: JwtContextType) {
    if (context.role === RolesEnum.ADMIN) {
      return this.usersService.getUsers(context);
    } else {
      throw new HttpException(`Не администратор!`, HttpStatus.CONFLICT);
    }
  }

  @Get('/stats/records')
  getRecords() {
    return this.usersService.getRecords();
  }

  @UseGuards(new JwtAuthGuard())
  @Get('/one/:userId')
  getUser(
    @ExtractJwtContext() context: JwtContextType,
    @Param('userId') userId: string,
  ) {
    if (context.role === RolesEnum.ADMIN) {
      return this.usersService.findOneById(userId);
    } else {
      throw new HttpException(`Не администратор!`, HttpStatus.CONFLICT);
    }
  }

  @UseGuards(new JwtAuthGuard())
  @Delete('/:userId')
  deleteUser(
    @ExtractJwtContext() context: JwtContextType,
    @Param('userId') userId: string,
  ) {
    return this.usersService.deleteUser(context, userId);
  }

  @UseGuards(new JwtAuthGuard())
  @Put('/:userId')
  updateUser(
    @ExtractJwtContext() context: JwtContextType,
    @Param('userId') userId: string,
    @Body() body: UpdateUserDTO,
  ) {
    return this.usersService.updateUser(context, userId, body);
  }
}
