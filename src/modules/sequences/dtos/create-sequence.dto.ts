import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsObject,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CardTypesEnum } from 'src/enums/card-types.enum';

export class CreateSequenceDTO {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  description: string;
}

export class LinearSequenceCreationDTO {
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(64)
  cardIds: string[];
}
