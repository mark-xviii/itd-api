import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChoiceSummaryEnum } from 'src/enums/choice-summary.enum';
import { ChoiceEnum } from 'src/enums/choice.enum';
import { ChoiceResponseType } from 'src/types/choice-response.type';
import { JwtContextType } from 'src/types/jwt-context.type';
import Utils from 'src/utils';
import { Repository } from 'typeorm';
import { DecksService } from '../decks/decks.service';
import { UsersService } from '../users/users.service';
import { MakeChoiceDTO } from './dtos/make-choice.dto';
import { SessionsEntity } from './entities/sessions.entity';
import { OutcomesEntity } from '../outcomes/entities/outcomes.entity';
import { CardTypesEnum } from 'src/enums/card-types.enum';
const moment = require('moment');

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionsEntity)
    private readonly sessionsRepository: Repository<SessionsEntity>,
    @Inject(DecksService) private readonly decksService: DecksService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  async getMyHistory(userContext: JwtContextType) {
    return await this.sessionsRepository.find({
      where: { user: { id: userContext.id } },
      order: { finishedAt: 'DESC' },
      take: 15,
    });
  }

  async getMySession(userContext: JwtContextType) {
    const { id: userId } = userContext;

    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new HttpException(
        `Нет пользователя с таким Id :: ${userId}`,
        HttpStatus.CONFLICT,
      );
    }

    const session = await this.sessionsRepository.findOne({
      where: { user: { id: userId }, isFinished: false },
      relations: {
        currentCard: { noOutcome: true, yesOutcome: true, character: true },
        deck: { cards: true },
        currentSequence: true,
      },
    });

    if (!session) {
      throw new HttpException(
        `Нет сессии в настоящий момент!`,
        HttpStatus.CONFLICT,
      );
    }

    return session;
  }

  async startSession(userContext: JwtContextType) {
    const { id: userId } = userContext;

    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new HttpException(
        `Нет пользователя с таким Id :: ${userId}`,
        HttpStatus.CONFLICT,
      );
    }

    const usersUnfinishedSessions = await this.sessionsRepository.find({
      where: { user: { id: userId }, isFinished: false },
    });

    if (usersUnfinishedSessions.length > 0) {
      throw new HttpException(
        `У вас есть незаконченные сессии!`,
        HttpStatus.CONFLICT,
      );
    }

    const newDeck = await this.decksService.generateDeck();

    const newSession = await this.sessionsRepository
      .create({
        user: user,
        deck: newDeck,
        currentCard: newDeck.cards[0],
        turn: 0,
        deckPosition: 0,
        money: 50,
        coffee: 50,
        personnel: 50,
        customers: 50,
      })
      .save();

    return await this.sessionsRepository.findOne({
      where: { id: newSession.id },
      relations: {
        user: true,
        currentCard: { noOutcome: true, yesOutcome: true, character: true },
        deck: { cards: true },
        currentSequence: true,
      },
    });
  }

  async makeDecisionAndDrawNextCardIfPossible(
    userContext: JwtContextType,
    { choice }: MakeChoiceDTO,
  ) {
    const { id: userId } = userContext;

    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new HttpException(
        `Нет пользователя с таким Id :: ${userId}`,
        HttpStatus.CONFLICT,
      );
    }

    const currentSession = await this.sessionsRepository.findOne({
      where: { user: { id: userId }, isFinished: false },
      relations: {
        currentCard: {
          noOutcome: true,
          yesOutcome: true,
          character: true,
          sequence: true,
          nextCard: {
            sequence: true,
            noOutcome: true,
            yesOutcome: true,
            character: true,
          },
        },
        deck: { cards: { sequence: true } },
        currentSequence: true,
        user: true,
      },
    });

    if (!currentSession) {
      throw new HttpException(
        `Нет сессии в настоящий момент!`,
        HttpStatus.CONFLICT,
      );
    }

    const response = await this.choiceWrapper(choice, currentSession);

    return response;
  }

  private async choiceWrapper(
    choice: ChoiceEnum,
    currentSession$: SessionsEntity,
  ): Promise<ChoiceResponseType> {
    const outcomeToPlay =
      choice === ChoiceEnum.NO
        ? currentSession$.currentCard.noOutcome
        : currentSession$.currentCard.yesOutcome;

    // calculate resources and etc

    const response = await this.calculateResourcesAndEtc(
      currentSession$,
      outcomeToPlay,
    );

    await currentSession$.save();

    return response;
  }

  private async calculateResourcesAndEtc(
    currentSession$: SessionsEntity,
    outcomeToPlay: OutcomesEntity,
  ): Promise<ChoiceResponseType> {
    if (currentSession$.isFinished) {
      throw new HttpException(
        'Нет сессии в настоящий момент',
        HttpStatus.CONFLICT,
      );
    }

    const { coffee, customers, personnel, money } = currentSession$;

    let summary: ChoiceResponseType = {
      type: null,
      summary: null,
      resourceObject: {
        coffee: 0,
        personnel: 0,
        customers: 0,
        money: 0,
      },
    };

    summary.resourceObject.coffee = coffee + outcomeToPlay.coffee;
    summary.resourceObject.personnel = personnel + outcomeToPlay.personnel;
    summary.resourceObject.customers = customers + outcomeToPlay.customers;
    summary.resourceObject.money = money + outcomeToPlay.money;

    currentSession$.coffee = summary.resourceObject.coffee;
    currentSession$.personnel = summary.resourceObject.personnel;
    currentSession$.customers = summary.resourceObject.customers;
    currentSession$.money = summary.resourceObject.money;

    summary.summary = '';

    const { min, max } = Utils.Constants.GAME_FEATURES_LIMITS;

    // check resources for failure

    let preSummary = [];

    if (summary.resourceObject.coffee >= max) {
      summary.type = ChoiceSummaryEnum.FAILURE;
      preSummary.push(
        'Вы превысили предельное допустимое значение кофе и вкусняшек в вашем офисе. Все объелись и больше не хотят работать.',
      );
    }

    if (summary.resourceObject.coffee <= min) {
      summary.type = ChoiceSummaryEnum.FAILURE;
      preSummary.push(
        'У персонала обнаружена необратимая острая нехватка кофе и вкусняшек. Дальнейшая работа не возможна.',
      );
    }

    if (summary.resourceObject.customers >= max) {
      summary.type = ChoiceSummaryEnum.FAILURE;
      preSummary.push(
        'В попытках набрать как можно больше заказчиков вы забыли о своих других проектах. Фокус персонала распылён и вы теперь связаны неисполненными обязательствами.',
      );
    }

    if (summary.resourceObject.customers <= min) {
      summary.type = ChoiceSummaryEnum.FAILURE;
      preSummary.push(
        `Ваша политика привела к тотальной непопулярности компании ${currentSession$.user.organizationTitle} на рынке IT.`,
      );
    }

    if (summary.resourceObject.personnel >= max) {
      summary.type = ChoiceSummaryEnum.FAILURE;
      preSummary.push(
        'Персонала столько много, что вы не можете больше им управлять! Наступает череда хаотичных увольнений, скандалов и задержанных зарплат.',
      );
    }

    if (summary.resourceObject.personnel <= min) {
      summary.type = ChoiceSummaryEnum.FAILURE;
      preSummary.push(
        `Вы лишились всего своего персонала. Очень страшно работать в компании ${currentSession$.user.organizationTitle}. Сочувствую.`,
      );
    }

    if (summary.resourceObject.money >= max) {
      summary.type = ChoiceSummaryEnum.FAILURE;
      preSummary.push(
        `Деньги, буквально, появляются из воздуха! Вы не сдерживаетесь и продаёте компанию ${currentSession$.user.organizationTitle} какому-то техногиганту. Теперь, с двумя коробками от ксерокса полные грязных американских денег вы скрываетесь в Сингапуре. Хэппи энд?`,
      );
    }

    if (summary.resourceObject.money <= min) {
      summary.type = ChoiceSummaryEnum.FAILURE;
      preSummary.push(
        `Из-за своего финансового положения, компания ${currentSession$.user.organizationTitle} не может продолжать свою работу.`,
      );
    }

    summary.summary = Utils.Random.shuffle(preSummary).join(' ');

    // if at least 1 failure finish session

    if (summary.type === ChoiceSummaryEnum.FAILURE) {
      currentSession$.finishedAt = moment(Date.now()).format(
        'YYYY-MM-DD HH:mm:ss',
      );

      currentSession$.isFinished = true;

      currentSession$.user.maxScoreRecord =
        currentSession$.user.maxScoreRecord < currentSession$.turn
          ? currentSession$.turn
          : currentSession$.user.maxScoreRecord;

      summary.type = ChoiceSummaryEnum.FAILURE;

      currentSession$.verdict = summary.summary;

      await this.usersService.setHighScore(
        currentSession$.user.id,
        currentSession$.user.maxScoreRecord,
      );

      return summary;
    }

    // if not a failure
    // check next card
    const __stolenSession = JSON.parse(
      JSON.stringify(currentSession$),
    ) as SessionsEntity;

    if (currentSession$.currentCard.nextCard) {
      currentSession$.currentSequence =
        __stolenSession.currentCard.nextCard.sequence;

      summary.type = ChoiceSummaryEnum.SEQUENCE_BEGINNING;
    } else {
      summary.type = ChoiceSummaryEnum.CONTINUE;
    }

    if (
      !currentSession$.currentCard.nextCard &&
      currentSession$.currentCard.type ===
        CardTypesEnum.SEQUENCE_ENDING.toString()
    ) {
      currentSession$.currentSequence = null;
      summary.type = ChoiceSummaryEnum.SEQUENCE_END;
    }

    if (
      currentSession$.deckPosition + 1 >= currentSession$.deck.cards.length &&
      summary.type !== ChoiceSummaryEnum.FAILURE.toString() &&
      summary.type !== ChoiceSummaryEnum.SEQUENCE_BEGINNING.toString() &&
      !currentSession$.currentSequence
    ) {
      summary.type = ChoiceSummaryEnum.VICTORY;

      currentSession$.finishedAt = moment(Date.now()).format(
        'YYYY-MM-DD HH:mm:ss',
      );

      currentSession$.isFinished = true;
    }

    if (summary.type !== ChoiceSummaryEnum.FAILURE.toString()) {
      if (summary.type === ChoiceSummaryEnum.SEQUENCE_BEGINNING) {
        currentSession$.currentCard = __stolenSession.currentCard.nextCard;

        summary.nextCard = __stolenSession.currentCard.nextCard;
      }

      if (summary.type === ChoiceSummaryEnum.SEQUENCE_END.toString()) {
        currentSession$.deckPosition += 1;

        currentSession$.currentSequence = null;

        if (currentSession$.deck.cards[currentSession$.deckPosition]) {
          currentSession$.currentCard =
            __stolenSession.deck.cards[currentSession$.deckPosition];

          summary.nextCard =
            __stolenSession.deck.cards[currentSession$.deckPosition];
        } else {
          summary.type === ChoiceSummaryEnum.VICTORY;
        }
      }

      if (summary.type === ChoiceSummaryEnum.CONTINUE.toString()) {
        currentSession$.deckPosition += 1;

        currentSession$.currentCard =
          __stolenSession.deck.cards[currentSession$.deckPosition];

        summary.nextCard = currentSession$.currentCard;
      }

      if (summary.type === ChoiceSummaryEnum.VICTORY.toString()) {
        currentSession$.currentSequence = null;

        currentSession$.finishedAt = moment(Date.now()).format(
          'YYYY-MM-DD HH:mm:ss',
        );

        currentSession$.isFinished = true;

        currentSession$.user.maxScoreRecord =
          currentSession$.user.maxScoreRecord < currentSession$.turn + 1
            ? currentSession$.turn + 1
            : currentSession$.user.maxScoreRecord;

        await this.usersService.setHighScore(
          currentSession$.user.id,
          currentSession$.user.maxScoreRecord,
        );
      }

      currentSession$.turn += 1;
    }

    if (summary.summary === '') {
      summary.summary = null;
    }

    return summary;
  }

  async finishSessionWillingly(userContext: JwtContextType) {
    const { id: userId } = userContext;

    const user = await this.usersService.findOneById(userId);

    const currentSession = await this.sessionsRepository.findOne({
      where: { user: { id: userId }, isFinished: false },
    });

    if (!currentSession) {
      throw new HttpException(
        `Нет сессии в настоящий момент!`,
        HttpStatus.CONFLICT,
      );
    }

    if (user.maxScoreRecord < currentSession.turn) {
      user.maxScoreRecord = currentSession.turn;
      await user.save();
    }

    return await this.sessionsRepository.update(currentSession.id, {
      isFinished: true,
      finishedAt: moment(moment.now()).format('YYYY-MM-DD HH:mm:ss'),
    });
  }
}
