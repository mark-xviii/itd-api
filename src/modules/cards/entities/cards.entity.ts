import { CardTypesEnum } from 'src/enums/card-types.enum';
import { CharactersEntity } from 'src/modules/characters/entities/characters.entity';
import { DecksEntity } from 'src/modules/decks/entities/decks.entity';
import { OutcomesEntity } from 'src/modules/outcomes/entities/outcomes.entity';
import { SequencesEntity } from 'src/modules/sequences/entities/sequences.entity';
import Utils from 'src/utils';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class CardsEntity extends Utils.DatabaseEntities.BaseEntityExtended {
  @Column({ nullable: false })
  text: string;

  @Column({ nullable: false, type: 'enum', enum: CardTypesEnum })
  type: CardTypesEnum;

  @ManyToOne(() => SequencesEntity, (sequence) => sequence.cards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  sequence: SequencesEntity;

  @ManyToMany(() => DecksEntity, (deck) => deck.cards, { onDelete: 'CASCADE' })
  decks: DecksEntity[];

  @ManyToOne(() => CharactersEntity, (character) => character.cards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  character: CharactersEntity;

  @Column({ nullable: false })
  yesText: string;

  @Column({ nullable: false })
  noText: string;

  @OneToOne(() => OutcomesEntity, (outcome) => outcome.card)
  @JoinColumn()
  yesOutcome?: OutcomesEntity;

  @OneToOne(() => OutcomesEntity, (outcome) => outcome.card)
  @JoinColumn()
  noOutcome?: OutcomesEntity;

  @ManyToOne(() => CardsEntity, (card) => card.id)
  @JoinColumn()
  nextCard?: CardsEntity;
}
