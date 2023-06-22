import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCharacterDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  position: string;
}
