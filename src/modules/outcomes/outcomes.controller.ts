import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateOutcomeDTO } from './dtos/create-outcome.dto';
import { UpdateOutcomeDTO } from './dtos/update-outcome.dto';
import { OutcomesService } from './outcomes.service';

@Controller('outcomes')
export class OutcomesController {
  // constructor(
  //   @Inject(OutcomesService) private readonly outcomesService: OutcomesService,
  // ) {}
  // @Get('/')
  // getAllOutcomes() {
  //   return this.outcomesService.getAllOutcomes();
  // }
  // @Get('/:outcomeId')
  // getOneOutcome(@Param('outcomeId') outcomeId: string) {
  //   return this.outcomesService.getOneOutcome(outcomeId);
  // }
  // @Post('/')
  // createOutcome(@Body() body: CreateOutcomeDTO) {
  //   return this.outcomesService.createOutcome(body);
  // }
  // @Delete('/:outcomeId')
  // deleteOutcome(@Param('outcomeId') outcomeId: string) {
  //   return this.outcomesService.deleteOutcome(outcomeId);
  // }
  // @Put('/:outcomeId')
  // updateOutcome(
  //   @Param('outcomeId') outcomeId: string,
  //   @Body() body: UpdateOutcomeDTO,
  // ) {
  //   return this.outcomesService.updateOutcome(outcomeId, body);
  // }
}
