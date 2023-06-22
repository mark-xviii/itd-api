import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCharacterDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  position: string;
}
