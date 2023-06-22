import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import {
  CreateSequenceDTO,
  LinearSequenceCreationDTO,
} from './dtos/create-sequence.dto';
import { UpdateSequenceDTO } from './dtos/update-sequence.dto';
import { SequencesEntity } from './entities/sequences.entity';
import { CardsEntity } from '../cards/entities/cards.entity';
import { of } from 'rxjs';
import { CardTypesEnum } from 'src/enums/card-types.enum';
import { OutcomesEntity } from '../outcomes/entities/outcomes.entity';

@Injectable()
export class SequencesService {
  constructor(
    @InjectRepository(SequencesEntity)
    private readonly sequencesRepository: Repository<SequencesEntity>,

    @InjectRepository(CardsEntity)
    private readonly cardsRepository: Repository<CardsEntity>,

    @InjectRepository(OutcomesEntity)
    private readonly outcomesRepository: Repository<OutcomesEntity>,
  ) {}

  async createLinearSequence({ cardIds }: LinearSequenceCreationDTO) {
    const beginning = await this.cardsRepository.findOne({
      where: { id: cardIds[0] },
      relations: {
        sequence: true,
        yesOutcome: true,
        noOutcome: true,
      },
    });

    const ending = await this.cardsRepository.findOne({
      where: { id: cardIds.at(-1) },
      relations: {
        sequence: true,
        yesOutcome: true,
        noOutcome: true,
      },
    });

    let sequenced: CardsEntity[] = [];

    if (cardIds.slice(1, -1).length > 0) {
      for (let i = 0; i < cardIds.slice(1, -1).length; i++) {
        sequenced.push(
          await this.cardsRepository.findOne({
            where: { id: cardIds.slice(1, -1)[i] },
            relations: {
              sequence: true,
              yesOutcome: true,
              noOutcome: true,
            },
          }),
        );
      }
    }

    if (
      !beginning.sequence ||
      !ending.sequence ||
      !sequenced.every((card) => !!card.sequence)
    ) {
      throw new HttpException(
        `Последовательность нарушена! Проверьте правильность создаваемых карточек.`,
        HttpStatus.CONFLICT,
      );
    }

    const toUnsequefy = await this.cardsRepository.find({
      where: { id: Not(In(cardIds)), sequence: { id: beginning.sequence.id } },
    });

    for (const tuns of toUnsequefy) {
      tuns.nextCard = null;
      await tuns.save();
    }

    await this.cardsRepository.update(beginning.id, {
      type: CardTypesEnum.SEQUENCE_BEGINNING,
      nextCard: sequenced.length > 0 ? sequenced[0] : ending,
    });

    if (sequenced.length > 0) {
      for (let i = 0; i < sequenced.length - 1; i++) {
        await this.cardsRepository.update(sequenced[i].id, {
          type: CardTypesEnum.SEQUENCED,
          nextCard: sequenced[i + 1],
        });
      }

      await this.cardsRepository.update(sequenced.at(-1).id, {
        type: CardTypesEnum.SEQUENCED,
        nextCard: ending,
      });
    }

    await this.cardsRepository.update(ending.id, {
      type: CardTypesEnum.SEQUENCE_ENDING,
      nextCard: null,
    });

    return await this.sequencesRepository.findOne({
      where: beginning.sequence.id,
      relations: { cards: { nextCard: true } },
    });
  }

  async getAllSequences() {
    return await this.sequencesRepository.find({});
  }

  async getOneGross(sequenceId: string) {
    return await await this.sequencesRepository.findOne({
      where: { id: sequenceId },
      relations: {
        cards: {
          sequence: true,
          character: true,
          nextCard: { character: true },
        },
      },
    });
  }

  async getOneSequence(sequenceId: string) {
    const starter = await this.sequencesRepository.findOne({
      where: { id: sequenceId },
      relations: {
        cards: {
          sequence: true,
          character: true,
          nextCard: { character: true },
        },
      },
    });

    let __formed = [] as CardsEntity[];

    if (starter.cards.length > 0) {
      const beginning = await this.cardsRepository.findOne({
        where: {
          type: CardTypesEnum.SEQUENCE_BEGINNING,
          sequence: { id: starter.id },
        },
        relations: {
          character: true,
          nextCard: {
            character: true,
            sequence: true,
            nextCard: { character: true },
          },
        },
      });

      const ending = await this.cardsRepository.findOne({
        where: {
          type: CardTypesEnum.SEQUENCE_ENDING,
          sequence: { id: starter.id },
        },
        relations: {
          character: true,
        },
      });

      // console.log(beginning);

      let insides = [];

      if (beginning.nextCard && ending) {
        if (beginning.nextCard.id !== ending.id) {
          insides.push(beginning.nextCard);

          let currentCard = beginning.nextCard;

          while (
            currentCard.nextCard?.id &&
            currentCard.nextCard.id !== ending.id
          ) {
            if (currentCard.nextCard) {
              insides.push(currentCard.nextCard);
            }

            currentCard = await this.cardsRepository.findOne({
              where: { id: currentCard.nextCard.id },
              relations: {
                character: true,
                nextCard: { character: true },
                sequence: true,
              },
            });
          }
        }
      }

      __formed = [beginning, ...insides, ending];
    }

    return { ...starter, cards: __formed } as SequencesEntity;
  }

  async createSequence({ name, description }: CreateSequenceDTO) {
    return await this.sequencesRepository
      .create({ name: name, description: description })
      .save();
  }

  async updateSequence(
    sequenceId: string,
    { name, description }: UpdateSequenceDTO,
  ) {
    const candidate = await this.sequencesRepository.findOne({
      where: { id: sequenceId },
    });

    if (!candidate) {
      throw new HttpException(
        `Нет последовательности с таким Id! :: ${sequenceId}`,
        HttpStatus.CONFLICT,
      );
    }

    return await this.sequencesRepository.update(sequenceId, {
      ...(name && { name: name }),
      ...(description && { description: description }),
    });
  }

  async deleteSequence(sequenceId: string) {
    const candidate = await this.sequencesRepository.findOne({
      where: { id: sequenceId },
    });

    if (!candidate) {
      throw new HttpException(
        `Нет последовательности с таким Id! :: ${sequenceId}`,
        HttpStatus.CONFLICT,
      );
    }

    return await this.sequencesRepository.delete(sequenceId);
  }

  async changeSequenceLength(sequenceId: string, difference: number) {
    const candidate = await this.sequencesRepository.findOne({
      where: { id: sequenceId },
    });

    if (!candidate) {
      throw new HttpException(
        `Нет последовательности с таким Id :: ${sequenceId}`,
        HttpStatus.CONFLICT,
      );
    }

    candidate.length += difference;

    return await candidate.save();
  }
}
