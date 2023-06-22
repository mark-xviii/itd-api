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
import {
  CreateSequenceDTO,
  LinearSequenceCreationDTO,
} from './dtos/create-sequence.dto';
import { UpdateSequenceDTO } from './dtos/update-sequence.dto';
import { SequencesService } from './sequences.service';

@Controller('sequences')
export class SequencesController {
  constructor(
    @Inject(SequencesService)
    private readonly sequencesService: SequencesService,
  ) {}

  @Get('/')
  getAllSequences() {
    return this.sequencesService.getAllSequences();
  }

  @Get('/:sequenceId')
  getOneSequence(@Param('sequenceId') sequenceId: string) {
    return this.sequencesService.getOneSequence(sequenceId);
  }

  @Post('/')
  createSequence(@Body() body: CreateSequenceDTO) {
    return this.sequencesService.createSequence(body);
  }

  @Post('/linear-creation')
  createLinearSequence(@Body() body: LinearSequenceCreationDTO) {
    return this.sequencesService.createLinearSequence(body);
  }

  @Put('/:sequenceId')
  updateSequence(
    @Param('sequenceId') sequenceId: string,
    @Body() body: UpdateSequenceDTO,
  ) {
    return this.sequencesService.updateSequence(sequenceId, body);
  }

  @Delete('/:sequenceId')
  deleteSequence(@Param('sequenceId') sequenceId: string) {
    return this.sequencesService.deleteSequence(sequenceId);
  }
}
