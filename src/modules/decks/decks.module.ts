import { Module } from '@nestjs/common';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecksEntity } from './entities/decks.entity';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [CardsModule, TypeOrmModule.forFeature([DecksEntity])],
  providers: [DecksService],
  controllers: [DecksController],
  exports: [DecksService],
})
export class DecksModule {}
