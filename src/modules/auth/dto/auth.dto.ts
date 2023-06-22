import { IsString, Length, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MaxLength(64)
  @MinLength(3)
  login: string;

  @IsString()
  @MaxLength(64)
  @MinLength(3)
  password: string;

  @IsString()
  @MaxLength(64)
  @MinLength(3)
  organizationTitle: string;
}

export class LoginUserDto {
  @IsString()
  @MaxLength(64)
  @MinLength(3)
  login: string;

  @IsString()
  @MaxLength(64)
  @MinLength(3)
  password: string;
}
