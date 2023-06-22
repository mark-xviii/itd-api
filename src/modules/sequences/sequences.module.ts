import { Module } from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { SequencesController } from './sequences.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SequencesEntity } from './entities/sequences.entity';
import { CardsEntity } from '../cards/entities/cards.entity';
import { OutcomesEntity } from '../outcomes/entities/outcomes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SequencesEntity, CardsEntity, OutcomesEntity]),
  ],
  providers: [SequencesService],
  controllers: [SequencesController],
  exports: [SequencesService],
})
export class SequencesModule {}
