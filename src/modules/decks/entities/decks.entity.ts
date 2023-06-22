import { CardsEntity } from 'src/modules/cards/entities/cards.entity';
import { SessionsEntity } from 'src/modules/sessions/entities/sessions.entity';
import Utils from 'src/utils';
import { Entity, JoinTable, ManyToMany, OneToOne } from 'typeorm';

@Entity()
export class DecksEntity extends Utils.DatabaseEntities.BaseEntityExtended {
  @OneToOne(() => SessionsEntity, (session) => session.deck)
  session: SessionsEntity;

  @ManyToMany(() => CardsEntity, (card) => card.decks, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  cards: CardsEntity[];
}
