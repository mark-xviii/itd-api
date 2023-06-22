import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { CardsEntity } from './entities/cards.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharactersModule } from '../characters/characters.module';
import { OutcomesModule } from '../outcomes/outcomes.module';
import Sequence from 'mysql2/typings/mysql/lib/protocol/sequences/Sequence';
import { SequencesModule } from '../sequences/sequences.module';

@Module({
  imports: [
    CharactersModule,
    OutcomesModule,
    TypeOrmModule.forFeature([CardsEntity]),
    SequencesModule,
  ],
  providers: [CardsService],
  controllers: [CardsController],
  exports: [CardsService],
})
export class CardsModule {}
