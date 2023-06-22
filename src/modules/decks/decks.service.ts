import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardsService } from '../cards/cards.service';
import { DecksEntity } from './entities/decks.entity';

@Injectable()
export class DecksService {
  constructor(
    @InjectRepository(DecksEntity)
    private readonly decksRepository: Repository<DecksEntity>,
    @Inject(CardsService) private readonly cardsService: CardsService,
  ) {}

  async generateDeck() {
    const cards = await this.cardsService.getCardsForDeckAndShuffle();

    const newDeck = await this.decksRepository.create({ cards: cards }).save();

    return newDeck;
  }
}
