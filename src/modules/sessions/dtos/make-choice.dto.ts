import { IsEnum } from 'class-validator';
import { ChoiceEnum } from 'src/enums/choice.enum';

export class MakeChoiceDTO {
  @IsEnum(ChoiceEnum)
  choice: ChoiceEnum;
}
