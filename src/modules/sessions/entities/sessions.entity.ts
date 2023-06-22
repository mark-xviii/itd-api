import { CardsEntity } from 'src/modules/cards/entities/cards.entity';
import { DecksEntity } from 'src/modules/decks/entities/decks.entity';
import { SequencesEntity } from 'src/modules/sequences/entities/sequences.entity';
import { UsersEntity } from 'src/modules/users/entities/users.entity';
import Utils from 'src/utils';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class SessionsEntity extends Utils.DatabaseEntities.BaseEntityExtended {
  @ManyToOne(() => UsersEntity, (user) => user.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UsersEntity;

  @OneToOne(() => DecksEntity, (deck) => deck.session, { onDelete: 'CASCADE' })
  @JoinColumn()
  deck: DecksEntity;

  @ManyToOne(() => CardsEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  currentCard: CardsEntity;

  @ManyToOne(() => SequencesEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  currentSequence: SequencesEntity;

  @Column({ type: 'int', default: 0, nullable: false })
  turn: number;

  @Column({ type: 'int', default: 0, nullable: false })
  deckPosition: number;

  @Column({ type: 'int', default: 50, nullable: false })
  coffee: number;

  @Column({ type: 'int', default: 50, nullable: false })
  personnel: number;

  @Column({ type: 'int', default: 50, nullable: false })
  money: number;

  @Column({ type: 'int', default: 50, nullable: false })
  customers: number;

  @Column({ nullable: true })
  verdict: string;

  @Column({ nullable: true, default: false })
  isFinished: boolean;

  @Column({ nullable: true, default: null })
  finishedAt: Date;
}
