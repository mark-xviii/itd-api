import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CardTypesEnum } from 'src/enums/card-types.enum';
import { OutcomeNestedInCardDTO } from './outcome-nested-in-card.dto';

export class CreateCardDTO {
  @IsEnum(CardTypesEnum)
  type: CardTypesEnum;

  @IsString()
  @MaxLength(256)
  text: string;

  @IsString()
  @MaxLength(256)
  yesText: string;

  @IsString()
  @MaxLength(256)
  noText: string;

  @ValidateNested()
  @Type(() => OutcomeNestedInCardDTO)
  yesOutcome: OutcomeNestedInCardDTO;

  @ValidateNested()
  @Type(() => OutcomeNestedInCardDTO)
  noOutcome: OutcomeNestedInCardDTO;

  @IsNumberString()
  characterId: string;

  @IsOptional()
  @IsNumberString()
  sequenceId: string;
}
