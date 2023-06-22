import { CardsEntity } from 'src/modules/cards/entities/cards.entity';
import Utils from 'src/utils';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class OutcomesEntity extends Utils.DatabaseEntities.BaseEntityExtended {
  @ManyToOne(() => CardsEntity, (card) => card.id, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  card: CardsEntity;

  @Column({ type: 'int', default: 0, nullable: false })
  coffee: number;

  @Column({ type: 'int', default: 0, nullable: false })
  personnel: number;

  @Column({ type: 'int', default: 0, nullable: false })
  money: number;

  @Column({ type: 'int', default: 0, nullable: false })
  customers: number;
}
