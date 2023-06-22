import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { JwtContextType } from 'src/types/jwt-context.type';
import { ExtractJwtContext } from '../auth/decorators/jwt.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { MakeChoiceDTO } from './dtos/make-choice.dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(
    @Inject(SessionsService) private readonly sessionsService: SessionsService,
  ) {}

  @UseGuards(new JwtAuthGuard())
  @Get('/my')
  getMySession(@ExtractJwtContext() context: JwtContextType) {
    return this.sessionsService.getMySession(context);
  }

  @UseGuards(new JwtAuthGuard())
  @Post('/start')
  startNewSession(@ExtractJwtContext() context: JwtContextType) {
    return this.sessionsService.startSession(context);
  }

  @UseGuards(new JwtAuthGuard())
  @Post('/make-choice')
  makeChoiceInSession(
    @ExtractJwtContext() context: JwtContextType,
    @Body() body: MakeChoiceDTO,
  ) {
    return this.sessionsService.makeDecisionAndDrawNextCardIfPossible(
      context,
      body,
    );
  }

  @UseGuards(new JwtAuthGuard())
  @Get('/history')
  getHistory(@ExtractJwtContext() context: JwtContextType) {
    return this.sessionsService.getMyHistory(context);
  }

  @UseGuards(new JwtAuthGuard())
  @Post('/finish')
  finishSessionWillingly(@ExtractJwtContext() context: JwtContextType) {
    return this.sessionsService.finishSessionWillingly(context);
  }
}
