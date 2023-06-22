import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CardTypesEnum } from 'src/enums/card-types.enum';
import { OutcomeNestedInCardDTO } from './outcome-nested-in-card.dto';

export class UpdateCardDTO {
  @IsOptional()
  @IsEnum(CardTypesEnum)
  type: CardTypesEnum;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  text: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  yesText: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  noText: string;

  @ValidateNested({ each: true })
  @Type(() => OutcomeNestedInCardDTO)
  @IsOptional()
  yesOutcome?: OutcomeNestedInCardDTO;

  @ValidateNested({ each: true })
  @Type(() => OutcomeNestedInCardDTO)
  @IsOptional()
  noOutcome?: OutcomeNestedInCardDTO;

  @IsOptional()
  @IsNumberString()
  characterId: string;

  @IsOptional()
  @IsNumberString()
  sequenceId: string;
}
