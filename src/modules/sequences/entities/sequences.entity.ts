import { CardTypesEnum } from 'src/enums/card-types.enum';
import { CardsEntity } from 'src/modules/cards/entities/cards.entity';
import Utils from 'src/utils';
import { AfterLoad, Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class SequencesEntity extends Utils.DatabaseEntities.BaseEntityExtended {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'int', default: 0, nullable: false })
  length: number;

  @OneToMany(() => CardsEntity, (card) => card.sequence, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  cards: CardsEntity[];
}
