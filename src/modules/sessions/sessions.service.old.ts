// import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CausesOfFailureEnum } from 'src/enums/cause-of-failure.enum';
// import { ChoiceSummaryEnum } from 'src/enums/choice-summary.enum';
// import { ChoiceEnum } from 'src/enums/choice.enum';
// import { CardTypesEnum } from 'src/enums/card-types.enum';
// import { ChoiceResponseType } from 'src/types/choice-response.type';
// import { JwtContextType } from 'src/types/jwt-context.type';
// import Utils from 'src/utils';
// import { In, Repository } from 'typeorm';
// import { DecksService } from '../decks/decks.service';
// import { UsersService } from '../users/users.service';
// import { MakeChoiceDTO } from './dtos/make-choice.dto';
// import { CausesOfFailureEnitity } from './entities/causes-of-failure.entity';
// import { SessionsEntity } from './entities/sessions.entity';
// import { SessionsCauseIntermediate } from './entities/session-cause-intermediate.entity';
// const moment = require('moment');

// @Injectable()
// export class SessionsService {
//   constructor(
//     @InjectRepository(SessionsEntity)
//     private readonly sessionsRepository: Repository<SessionsEntity>,
//     @InjectRepository(CausesOfFailureEnitity)
//     private readonly causesOfFailureRepository: Repository<CausesOfFailureEnitity>,
//     @InjectRepository(SessionsCauseIntermediate)
//     private readonly sessionsCauseIntermediateRepotory: Repository<SessionsCauseIntermediate>,
//     @Inject(DecksService) private readonly decksService: DecksService,
//     @Inject(UsersService) private readonly usersService: UsersService,
//   ) {
//     this.seedWithCausesOfFailure();
//   }

//   private async seedWithCausesOfFailure() {
//     for (const cause of Object.values(CausesOfFailureEnum)) {
//       const candidate = await this.causesOfFailureRepository.findOne({
//         where: { causeOfFailure: cause },
//       });

//       if (!candidate) {
//         await this.causesOfFailureRepository
//           .create({ causeOfFailure: cause })
//           .save();

//         console.log(`New cause of failure created :: ${cause}`);
//       }
//     }
//   }

//   async getMySession(userContext: JwtContextType) {
//     const { id: userId } = userContext;

//     const user = await this.usersService.findOneById(userId);

//     if (!user) {
//       throw new HttpException(
//         `No such userId :: ${userId}`,
//         HttpStatus.CONFLICT,
//       );
//     }

//     const session = await this.sessionsRepository.findOne({
//       where: { user: { id: userId }, isFinished: false },
//       relations: {
//         currentCard: { noOutcome: true, yesOutcome: true, character: true },
//         deck: { cards: true },
//         currentSequence: true,
//       },
//     });

//     if (!session) {
//       throw new HttpException(`No session at the moment!`, HttpStatus.CONFLICT);
//     }

//     return session;
//   }

//   async startSession(userContext: JwtContextType) {
//     const { id: userId } = userContext;

//     const user = await this.usersService.findOneById(userId);

//     if (!user) {
//       throw new HttpException(
//         `No such userId :: ${userId}`,
//         HttpStatus.CONFLICT,
//       );
//     }

//     const usersUnfinishedSessions = await this.sessionsRepository.find({
//       where: { user: { id: userId }, isFinished: false },
//     });

//     if (usersUnfinishedSessions.length > 0) {
//       throw new HttpException(
//         `You have unfinished sessions!`,
//         HttpStatus.CONFLICT,
//       );
//     }

//     const newDeck = await this.decksService.generateDeck();

//     const newSession = await this.sessionsRepository
//       .create({
//         user: user,
//         deck: newDeck,
//         currentCard: newDeck.cards[0],
//         turn: 0,
//         deckPosition: 0,
//         money: 50,
//         coffee: 50,
//         personnel: 50,
//         customers: 50,
//       })
//       .save();

//     return await this.sessionsRepository.findOne({
//       where: { id: newSession.id },
//       relations: {
//         user: true,
//         currentCard: { noOutcome: true, yesOutcome: true, character: true },
//         deck: { cards: true },
//         currentSequence: true,
//       },
//     });
//   }

//   async makeDecisionAndDrawNextCardIfPossible(
//     userContext: JwtContextType,
//     { choice }: MakeChoiceDTO,
//   ) {
//     const { id: userId } = userContext;

//     const user = await this.usersService.findOneById(userId);

//     if (!user) {
//       throw new HttpException(
//         `No such userId :: ${userId}`,
//         HttpStatus.CONFLICT,
//       );
//     }

//     const currentSession = await this.sessionsRepository.findOne({
//       where: { user: { id: userId }, isFinished: false },
//       relations: {
//         currentCard: {
//           noOutcome: true,
//           yesOutcome: true,
//           character: true,
//           sequence: true,
//         },
//         deck: { cards: { sequence: true } },
//         currentSequence: true,
//         user: true,
//       },
//     });

//     if (!currentSession) {
//       throw new HttpException(`No session at the moment!`, HttpStatus.CONFLICT);
//     }

//     const result = this.choiceWrapper(choice, currentSession);

//     currentSession.save();

//     return result;
//   }

//   private async choiceWrapper(
//     choice: ChoiceEnum,
//     currentSession: SessionsEntity,
//   ): Promise<ChoiceResponseType> {
//     const { noOutcome, yesOutcome } = currentSession.currentCard;

//     if (!noOutcome) {
//       throw new HttpException(
//         `No noOutcome for the card!`,
//         HttpStatus.CONFLICT,
//       );
//     }

//     if (!yesOutcome) {
//       throw new HttpException(
//         `No yesOutcome for the card!`,
//         HttpStatus.CONFLICT,
//       );
//     }

//     let response: ChoiceResponseType = null;

//     if (currentSession.currentCard.type === CardTypesEnum.COMMON) {
//       if (choice === ChoiceEnum.NO) {
//         const failure = await this.checkForFailureAndCalculate(
//           currentSession,
//           noOutcome.coffee,
//           noOutcome.personnel,
//           noOutcome.customers,
//           noOutcome.money,
//         );

//         if (failure) {
//           response = {
//             type: ChoiceSummaryEnum.FAILURE,
//             summary: currentSession.verdict,
//           };
//         } else {
//           response = {
//             type: ChoiceSummaryEnum.CONTINUE,
//             summary: noOutcome.postScriptum,
//           };
//         }
//       }

//       if (choice === ChoiceEnum.YES) {
//         const failure = await this.checkForFailureAndCalculate(
//           currentSession,
//           yesOutcome.coffee,
//           yesOutcome.personnel,
//           yesOutcome.customers,
//           yesOutcome.money,
//         );

//         if (failure) {
//           response = {
//             type: ChoiceSummaryEnum.FAILURE,
//             summary: currentSession.verdict,
//           };
//         } else {
//           response = {
//             type: ChoiceSummaryEnum.CONTINUE,
//             summary: yesOutcome.postScriptum,
//           };
//         }
//       }

//       const newTurn = currentSession.turn + 1;

//       currentSession.deckPosition += 1;

//       currentSession.turn = newTurn;

//       currentSession.currentCard = currentSession.deck.cards[newTurn];

//       const _currentSession = await this.sessionsRepository.findOne({
//         where: { id: currentSession.id },
//         relations: {
//           currentCard: true,
//           deck: true,
//           causesOfFailure: { causeOfFailure: true },
//         },
//       });

//       currentSession.causesOfFailure = _currentSession.causesOfFailure;

//       console.log(8417, currentSession);

//       await this.sessionsRepository.save(currentSession);

//       return { ...response, nextCard: _currentSession.currentCard };
//     }

//     // if (currentSession.currentCard.type === CardTypesEnum.SEQUENCE_BEGINNING) {
//     //   if (choice === ChoiceEnum.NO) {
//     //     const failure = this.checkForFailureAndCalculate(
//     //       currentSession,
//     //       noOutcome.coffee,
//     //       noOutcome.personnel,
//     //       noOutcome.customers,
//     //       noOutcome.money,
//     //     );

//     //     if (failure) {
//     //       response = {
//     //         type: ChoiceSummaryEnum.FAILURE,
//     //         summary: currentSession.verdict,
//     //       };
//     //     }

//     //     response = {
//     //       type: ChoiceSummaryEnum.CONTINUE,
//     //       summary: noOutcome.postScriptum,
//     //     };
//     //   }

//     //   if (choice === ChoiceEnum.YES) {
//     //     const failure = this.checkForFailureAndCalculate(
//     //       currentSession,
//     //       yesOutcome.coffee,
//     //       yesOutcome.personnel,
//     //       yesOutcome.customers,
//     //       yesOutcome.money,
//     //     );

//     //     if (failure) {
//     //       response = {
//     //         type: ChoiceSummaryEnum.FAILURE,
//     //         summary: currentSession.verdict,
//     //       };
//     //     }

//     //     response = {
//     //       type: ChoiceSummaryEnum.CONTINUE,
//     //       summary: yesOutcome.postScriptum,
//     //     };
//     //   }

//     //   const newTurn = currentSession.turn + 1;

//     //   currentSession.turn += newTurn;

//     //   currentSession.currentCard = currentSession.deck.cards[newTurn];

//     //   await currentSession.save();

//     //   return { ...response, nextCard: currentSession.currentCard };
//     // }

//     // if (currentSession.currentCard.type === CardTypesEnum.SEQUENCE_ENDING) {
//     // }
//   }

//   private async checkForFailureAndCalculate(
//     currentSession: SessionsEntity,
//     coffee: number,
//     personnel: number,
//     customers: number,
//     money: number,
//   ) {
//     const possibleCausesOfFailure: CausesOfFailureEnum[] = [];

//     const { min, max } = Utils.Constants.GAME_FEATURES_LIMITS;

//     currentSession.coffee += coffee;
//     currentSession.personnel += personnel;
//     currentSession.customers += customers;
//     currentSession.money += money;

//     if (currentSession.coffee >= max) {
//       possibleCausesOfFailure.push(CausesOfFailureEnum.OVERSUFFICIENT_COFFEE);
//     }

//     if (currentSession.coffee <= min) {
//       possibleCausesOfFailure.push(CausesOfFailureEnum.INSUFFICIENT_COFFEE);
//     }

//     if (currentSession.personnel >= max) {
//       possibleCausesOfFailure.push(
//         CausesOfFailureEnum.OVERSUFFICIENT_PERSONNEL,
//       );
//     }

//     if (currentSession.personnel <= min) {
//       possibleCausesOfFailure.push(CausesOfFailureEnum.INSUFFICIENT_PERSONNEL);
//     }

//     if (currentSession.customers >= max) {
//       possibleCausesOfFailure.push(
//         CausesOfFailureEnum.OVERSUFFICIENT_CUSTOMERS,
//       );
//     }

//     if (currentSession.customers <= min) {
//       possibleCausesOfFailure.push(CausesOfFailureEnum.INSUFFICIENT_CUSTOMERS);
//     }

//     if (currentSession.money >= max) {
//       possibleCausesOfFailure.push(CausesOfFailureEnum.OVERSUFFICIENT_MONEY);
//     }

//     if (currentSession.money <= min) {
//       possibleCausesOfFailure.push(CausesOfFailureEnum.INSUFFICIENT_MONEY);
//     }

//     console.log(
//       '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
//       possibleCausesOfFailure,
//     );

//     if (possibleCausesOfFailure.length > 0) {
//       await this.finishSessionUnwillingly(
//         currentSession,
//         possibleCausesOfFailure,
//       );

//       return true;
//     }

//     await currentSession.save();

//     return false;
//   }

//   private async formulateGameEndingDueToFail(
//     currentSession: SessionsEntity,
//     causes: CausesOfFailureEnitity[],
//   ) {
//     console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^', currentSession);

//     let verdict = '';

//     const causesOfFailureFlattened: CausesOfFailureEnum[] = causes.map(
//       (cause) => cause.causeOfFailure,
//     );

//     const { multipleExist } = Utils.Array;

//     // if (causesOfFailureFlattened.length === 1) {
//     const singleCause = causesOfFailureFlattened[0];

//     if (singleCause === CausesOfFailureEnum.INSUFFICIENT_COFFEE) {
//       verdict +=
//         'Острая нехватка кофе и прилагающихся вкусностей ударила по энергетическим ресурсам ваших работников - теперь они не могут выполнять работу в прежнем темпе и вскоре погибнут от нехватки углеводов.';
//     }

//     if (singleCause === CausesOfFailureEnum.OVERSUFFICIENT_COFFEE) {
//       verdict +=
//         'Переизбыток кофе и прилагающихся вкусностей вызвал у ваших работников спектр всевозможных заболеваний: от сахарного диабета до мерцательной аритмии. Теперь они вынуждены проводить время у врачей, а вы работать в одиночку.';
//     }

//     if (singleCause === CausesOfFailureEnum.INSUFFICIENT_CUSTOMERS) {
//       verdict +=
//         'Ваша компания по разработке программного обеспечения прослыла не самой благонадёжной на рынке. Теперь вы разрабатываете ПО для гос. корпораций и ваша зарплата привяза к местной валюте. Ваша основная цель - выживание.';
//     }

//     if (singleCause === CausesOfFailureEnum.OVERSUFFICIENT_CUSTOMERS) {
//       verdict +=
//         'Заказчиков настолько много, что вы попросту не успеваете обрабатывать новые заказы, а проекты, уже бывшие на онбординге, проваливаются из-за неправильного менеджмента - разработчики вынуждены работать над 3-5 проектами одновременно. Куда же такое годится?';
//     }

//     if (singleCause === CausesOfFailureEnum.INSUFFICIENT_PERSONNEL) {
//       verdict +=
//         'Вы вызвали недовольство нынешнего рабочего состава. Разработчки, бизнес-аналитики, дизайнеры и главбух отказываются работать и подают на увольнение. Дальнейшая работа с таким коллективом невозможна.';
//     }

//     if (singleCause === CausesOfFailureEnum.OVERSUFFICIENT_PERSONNEL) {
//       verdict +=
//         'Вы наняли столько работников, что подавляющее большинство просто бездельничает. Они сами организовали корпоратив. Вас пригласили из вежливости, но поскольку с вами никто не считается, а в толпе есть лидер посильнее, вас избивают.';
//     }

//     if (singleCause === CausesOfFailureEnum.INSUFFICIENT_MONEY) {
//       verdict +=
//         'Из-за невозможности продолжать бизнес дальше, вы подаёте на банкротство, а все работники уходят.';
//     }

//     if (singleCause === CausesOfFailureEnum.OVERSUFFICIENT_MONEY) {
//       verdict +=
//         'Денег так много, что вы можете себе позволить каждые сутки летать на экзотические курорты в сопровождении лиц пониженной социальной ответственности. Вы так быстро продуваете весь капитал, что снижаете зарплаты. В конечном итоге, денег не остаётся и вы подаёте на банкротство будучи на необитаемом острове.';
//     }
//     // }

//     if (
//       multipleExist(
//         [CausesOfFailureEnum.INSUFFICIENT_MONEY],
//         causesOfFailureFlattened,
//       )
//     ) {
//       verdict +=
//         'Ваш незрелый менеджмент привёл к краху экономической модели вашей компании.<br>';
//     }

//     currentSession.verdict = verdict;

//     await currentSession.save();

//     return true;
//   }

//   private async finishSessionUnwillingly(
//     currentSession: SessionsEntity,
//     causesOfFailure: CausesOfFailureEnum[],
//   ) {
//     currentSession.isFinished = true;

//     const causes = await this.causesOfFailureRepository.find({
//       where: { causeOfFailure: In(causesOfFailure) },
//     });

//     currentSession.causesOfFailure = [];

//     let _causes = [];

//     for (const cause of causes) {
//       _causes.push(
//         await this.sessionsCauseIntermediateRepotory.save(
//           this.sessionsCauseIntermediateRepotory.create({
//             session: currentSession,
//             sessionId: currentSession.id,
//             causeOfFailureId: cause.id,
//             causeOfFailure: cause,
//           }),
//         ),
//       );
//     }

//     currentSession = await this.sessionsRepository.findOne({
//       where: { id: currentSession.id },
//       relations: {
//         deck: true,
//         currentCard: true,
//         currentSequence: true,
//         causesOfFailure: true,
//         user: true,
//       },
//     });

//     console.log(
//       '!@%$*&!@$&*!@%^$&^!&@*^$(!(@*&%^!@(*^%$(&*%@!',
//       currentSession.causesOfFailure,
//     );

//     currentSession.finishedAt = moment(Date.now()).format(
//       'YYYY-MM-DD HH:mm:ss',
//     );

//     await currentSession.save();

//     await this.formulateGameEndingDueToFail(currentSession, _causes);

//     if (currentSession.user.maxScoreRecord < currentSession.turn) {
//       currentSession.user.maxScoreRecord = currentSession.turn;
//       await currentSession.user.save();
//     }

//     await currentSession.save();
//   }

//   async finishSessionWillingly(userContext: JwtContextType) {
//     const { id: userId } = userContext;

//     const user = await this.usersService.findOneById(userId);

//     const currentSession = await this.sessionsRepository.findOne({
//       where: { user: { id: userId }, isFinished: false },
//     });

//     if (!currentSession) {
//       throw new HttpException(
//         `No session to finish at the moment!`,
//         HttpStatus.CONFLICT,
//       );
//     }

//     if (user.maxScoreRecord < currentSession.turn) {
//       user.maxScoreRecord = currentSession.turn;
//       await user.save();
//     }

//     return await this.sessionsRepository.update(currentSession.id, {
//       isFinished: true,
//       finishedAt: moment(moment.now()).format('YYYY-MM-DD HH:mm:ss'),
//     });
//   }
// }
