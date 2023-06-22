import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { throws } from 'assert';
import { Repository } from 'typeorm';
import { CardsService } from '../cards/cards.service';
import { CardsEntity } from '../cards/entities/cards.entity';
import { CreateOutcomeDTO } from './dtos/create-outcome.dto';
import { UpdateOutcomeDTO } from './dtos/update-outcome.dto';
import { OutcomesEntity } from './entities/outcomes.entity';

@Injectable()
export class OutcomesService {
  constructor(
    @InjectRepository(OutcomesEntity)
    private readonly outcomesRepository: Repository<OutcomesEntity>,
    @InjectRepository(CardsEntity)
    private readonly cardsRepository: Repository<CardsEntity>,
  ) {}

  async getAllOutcomes() {
    return await this.outcomesRepository.find({});
  }

  async getOneOutcome(outcomeId: string) {
    return await this.outcomesRepository.findOne({ where: { id: outcomeId } });
  }

  async createOutcome({
    coffee,
    personnel,
    money,
    customers,
    nextCardId,
  }: CreateOutcomeDTO) {
    let nextCard;

    if (nextCardId) {
      const candidate = await this.cardsRepository.findOne({
        where: { id: nextCardId },
      });

      if (!candidate) {
        throw new HttpException(
          `Нет следующей карты с такой Id! :: ${nextCardId}`,
          HttpStatus.CONFLICT,
        );
      }

      nextCard = candidate;
    }

    const newOutcome = await this.outcomesRepository
      .create({
        ...(nextCard && { nextCard: nextCard }),
        coffee: coffee,
        personnel: personnel,
        money: money,
        customers: customers,
      })
      .save();

    return await this.outcomesRepository.findOne({
      where: { id: newOutcome.id },
      relations: { card: { nextCard: true } },
    });
  }

  async updateOutcome(
    outcomeId: string,
    { coffee, personnel, money, customers, cardId }: UpdateOutcomeDTO,
  ) {
    const updateCandidate = await this.outcomesRepository.findOne({
      where: { id: outcomeId },
    });

    if (!updateCandidate) {
      throw new HttpException(
        `Нет исхода с таким Id! ::  ${outcomeId}`,
        HttpStatus.CONFLICT,
      );
    }

    await updateCandidate.save();

    await this.outcomesRepository.update(outcomeId, {
      ...((coffee || coffee === 0) && { coffee: coffee }),
      ...((personnel || personnel === 0) && { personnel: personnel }),
      ...((money || money === 0) && { money: money }),
      ...((customers || customers === 0) && { customers: customers }),
      ...(cardId && { card: { id: cardId } }),
    });

    return await this.outcomesRepository.findOne({ where: { id: outcomeId } });
  }

  async deleteOutcome(outcomeId: string) {
    const candidate = await this.outcomesRepository.findOne({
      where: { id: outcomeId },
    });

    if (!candidate) {
      throw new HttpException(
        `Нет исхода с таким Id! :: ${outcomeId}`,
        HttpStatus.CONFLICT,
      );
    }

    return await this.outcomesRepository.delete(outcomeId);
  }
}
