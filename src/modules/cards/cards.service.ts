import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardTypesEnum } from 'src/enums/card-types.enum';
import Utils from 'src/utils';
import { In, Repository } from 'typeorm';
import { CharactersService } from '../characters/characters.service';
import { OutcomesService } from '../outcomes/outcomes.service';
import { SequencesService } from '../sequences/sequences.service';
import { CongenialCardsDTO } from './dtos/congenial.dto';
import { CreateCardDTO } from './dtos/create-card.dto';
import { UpdateCardDTO } from './dtos/update-card.dto';
import { CardsEntity } from './entities/cards.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardsEntity)
    private readonly cardsRepository: Repository<CardsEntity>,
    @Inject(OutcomesService)
    private readonly outcomesService: OutcomesService,
    @Inject(CharactersService)
    private readonly charactersService: CharactersService,
    @Inject(SequencesService)
    private readonly sequencesService: SequencesService,
  ) {}

  async getAllCards() {
    return await this.cardsRepository.find({
      relations: {
        noOutcome: true,
        yesOutcome: true,
        sequence: true,
        character: true,
      },
    });
  }

  async getAllNonSequencedCards() {
    return await this.cardsRepository.find({
      where: { type: CardTypesEnum.COMMON },
      relations: {
        noOutcome: true,
        yesOutcome: true,
        sequence: true,
        character: true,
      },
    });
  }

  async getOneCard(cardId: string) {
    return await this.cardsRepository.findOne({
      where: { id: cardId },
      relations: {
        yesOutcome: true,
        noOutcome: true,
        sequence: true,
        character: true,
      },
    });
  }

  async createCard({
    type,
    text,
    noText,
    yesText,
    noOutcome,
    yesOutcome,
    characterId,
    sequenceId,
  }: CreateCardDTO) {
    let _noOutcome, _yesOutcome, character, sequence;

    if (sequenceId) {
      const candidate = await this.sequencesService.getOneGross(sequenceId);

      if (candidate) {
        sequence = candidate;
      }

      if (type === CardTypesEnum.SEQUENCE_BEGINNING) {
        if (
          candidate.cards.filter(
            (_card) => _card.type === CardTypesEnum.SEQUENCE_BEGINNING,
          ).length >= 1
        ) {
          throw new HttpException(
            `Нельзя создать более одного начала!`,
            HttpStatus.CONFLICT,
          );
        }
      }

      if (type === CardTypesEnum.SEQUENCE_ENDING) {
        if (
          candidate.cards.filter(
            (_card) => _card.type === CardTypesEnum.SEQUENCE_ENDING,
          ).length >= 1
        ) {
          throw new HttpException(
            `Нельзя создать более одного завершения последовательности!`,
            HttpStatus.CONFLICT,
          );
        }
      }
    }
    if (characterId) {
      const candidate = await this.charactersService.getOneCharacter(
        characterId,
      );

      if (!candidate) {
        throw new HttpException(
          `Нет персонажа с таким Id! :: ${characterId}`,
          HttpStatus.CONFLICT,
        );
      }

      character = candidate;
    }

    if ((noOutcome.nextCardId || yesOutcome.nextCardId) && !sequence) {
      throw new HttpException(
        'Все карточки в последовательности должны иметь соответствующий статус!',
        HttpStatus.CONFLICT,
      );
    }

    if (noOutcome) {
      _noOutcome = await this.outcomesService.createOutcome(noOutcome);
    }

    if (yesOutcome) {
      _yesOutcome = await this.outcomesService.createOutcome(yesOutcome);
    }

    const newCard = await this.cardsRepository
      .create({
        type: type,
        text: text,
        noText: noText,
        yesText: yesText,
        noOutcome: _noOutcome,
        yesOutcome: _yesOutcome,
        character: character,
        sequence: sequence,
      })
      .save();

    await newCard.save();

    await this.outcomesService.updateOutcome(newCard.yesOutcome.id, {
      cardId: newCard.id,
    });

    await this.outcomesService.updateOutcome(newCard.noOutcome.id, {
      cardId: newCard.id,
    });

    if (sequence) {
      await this.sequencesService.changeSequenceLength(sequenceId, 1);
    }

    return await this.cardsRepository.findOne({
      where: { id: newCard.id },
      relations: {
        noOutcome: true,
        yesOutcome: true,
        nextCard: true,
        character: true,
        sequence: true,
      },
    });
  }

  async updateCard(
    cardId: string,
    {
      type,
      text,
      yesText,
      noText,
      yesOutcome,
      noOutcome,
      characterId,
      sequenceId,
    }: UpdateCardDTO,
  ) {
    let candidateCard = await this.cardsRepository.findOne({
      where: { id: cardId },
      relations: {
        noOutcome: true,
        yesOutcome: true,
        character: true,
        nextCard: true,
        sequence: { cards: true },
      },
    });

    if (!candidateCard) {
      throw new HttpException(
        `Нет карточки с таким Id! :: ${cardId}`,
        HttpStatus.CONFLICT,
      );
    }

    if (sequenceId) {
      const candidate = await this.sequencesService.getOneGross(sequenceId);

      if (candidate) {
        candidateCard.sequence = candidate;
      }

      if (type === CardTypesEnum.SEQUENCE_BEGINNING) {
        if (
          candidate.cards.filter(
            (_card) => _card.type === CardTypesEnum.SEQUENCE_BEGINNING,
          ).length >= 1
        ) {
          throw new HttpException(
            `Нельзя создать более чем одно начало последовательности!`,
            HttpStatus.CONFLICT,
          );
        }
      }

      if (type === CardTypesEnum.SEQUENCE_ENDING) {
        if (
          candidate.cards.filter(
            (_card) => _card.type === CardTypesEnum.SEQUENCE_ENDING,
          ).length >= 1
        ) {
          throw new HttpException(
            `Нельзя создать более одного завершения последовательности!`,
            HttpStatus.CONFLICT,
          );
        }
      }
    }

    if (characterId) {
      const candidate = await this.charactersService.getOneCharacter(
        characterId,
      );

      if (candidate) {
        candidateCard.character = candidate;
      }
    }

    if (type) {
      candidateCard.type = type;
    }

    if (text) {
      candidateCard.text = text;
    }

    if (noText) {
      candidateCard.noText = noText;
    }

    if (yesText) {
      candidateCard.yesText = yesText;
    }

    if (noOutcome) {
      await this.outcomesService.updateOutcome(
        candidateCard.noOutcome.id,
        noOutcome,
      );
    }

    if (yesOutcome) {
      await this.outcomesService.updateOutcome(
        candidateCard.yesOutcome.id,
        yesOutcome,
      );
    }

    if (type === CardTypesEnum.COMMON) {
      this.sequencesService.changeSequenceLength(candidateCard.sequence.id, -1);
      candidateCard.nextCard = null;
      candidateCard.sequence = null;
    }

    await this.cardsRepository.update(cardId, candidateCard);

    return await this.cardsRepository.findOne({
      where: { id: cardId },
      relations: {
        character: true,
        yesOutcome: true,
        noOutcome: true,
        sequence: true,
      },
    });
  }

  async deleteCard(cardId: string) {
    const candidate = await this.cardsRepository.findOne({
      where: { id: cardId },
      relations: { sequence: true, yesOutcome: true, noOutcome: true },
    });

    if (!candidate) {
      throw new HttpException(
        `Нет карточки с таким Id! :: ${cardId}`,
        HttpStatus.CONFLICT,
      );
    }

    if (candidate.sequence) {
      await this.sequencesService.changeSequenceLength(
        candidate.sequence.id,
        -1,
      );
    }

    return await this.cardsRepository.delete(cardId);
  }

  async getCardsForDeckAndShuffle() {
    const cards = await this.cardsRepository.find({
      where: {
        type: In([CardTypesEnum.COMMON, CardTypesEnum.SEQUENCE_BEGINNING]),
      },
      relations: { character: true, yesOutcome: true, noOutcome: true },
    });

    if (cards.length === 0) {
      throw new HttpException(
        `Нет карточек в игровой кампании!`,
        HttpStatus.CONFLICT,
      );
    }

    return Utils.Random.shuffle(cards);
  }

  async getCardsForSequencesByType() {
    return await this.cardsRepository.findOne({
      where: {
        type: In([CardTypesEnum.SEQUENCED, CardTypesEnum.SEQUENCE_ENDING]),
      },
    });
  }
}
