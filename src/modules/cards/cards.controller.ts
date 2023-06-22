import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CongenialCardsDTO } from './dtos/congenial.dto';
import { CreateCardDTO } from './dtos/create-card.dto';
import { UpdateCardDTO } from './dtos/update-card.dto';

@Controller('cards')
export class CardsController {
  constructor(
    @Inject(CardsService) private readonly cardsService: CardsService,
  ) {}

  @Get('/')
  getAllCards() {
    return this.cardsService.getAllCards();
  }

  @Get('/:cardId')
  getOneCard(@Param('cardId') cardId: string) {
    return this.cardsService.getOneCard(cardId);
  }

  @Get('/non/sequenced')
  getNonSequencedCards() {
    return this.cardsService.getAllNonSequencedCards();
  }

  @Post('/')
  createCard(@Body() body: CreateCardDTO) {
    return this.cardsService.createCard(body);
  }

  @Put('/:cardId')
  updateCard(@Param('cardId') cardId: string, @Body() body: UpdateCardDTO) {
    return this.cardsService.updateCard(cardId, body);
  }

  @Delete('/:cardId')
  deleteCard(@Param('cardId') cardId: string) {
    return this.cardsService.deleteCard(cardId);
  }
}
