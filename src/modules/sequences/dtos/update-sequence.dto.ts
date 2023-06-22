import {
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSequenceDTO {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  @MinLength(3)
  description: string;
}
