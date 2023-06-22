import { CardsEntity } from 'src/modules/cards/entities/cards.entity';
import Utils from 'src/utils';
import { AfterLoad, Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class CharactersEntity extends Utils.DatabaseEntities
  .BaseEntityExtended {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  position: string;

  @Column({ nullable: true })
  imageLink?: string;

  @OneToMany(() => CardsEntity, (card) => card.character)
  cards: CardsEntity[];

  @AfterLoad()
  setPublicLinks() {
    this.imageLink = Utils.StringFormatting.generatePublicLink(this.imageLink);
  }
}
