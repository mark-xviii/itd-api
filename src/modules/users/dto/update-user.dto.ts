import {
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @MinLength(3)
  login: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @MinLength(3)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @MinLength(3)
  organizationTitle: string;
}
