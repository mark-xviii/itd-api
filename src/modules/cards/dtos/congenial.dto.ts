import { IsEnum, IsOptional, MaxLength } from 'class-validator';
import { CardTypesEnum } from 'src/enums/card-types.enum';

export class CongenialCardsDTO {
  @IsOptional()
  @MaxLength(64)
  cardId?: string;

  @IsOptional()
  @IsEnum(CardTypesEnum)
  cardType?: CardTypesEnum;

  @IsOptional()
  @MaxLength(64)
  sequenceId?: string;
}
