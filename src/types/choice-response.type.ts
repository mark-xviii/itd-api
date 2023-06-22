import { ChoiceSummaryEnum } from 'src/enums/choice-summary.enum';
import { CardsEntity } from 'src/modules/cards/entities/cards.entity';
import { ResoureObjectType } from './resource-object.type';

export type ChoiceResponseType = {
  type: ChoiceSummaryEnum;
  summary: string;
  resourceObject: ResoureObjectType;
  nextCard?: CardsEntity;
};
