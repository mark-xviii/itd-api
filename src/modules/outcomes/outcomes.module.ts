import { Module } from '@nestjs/common';
import { OutcomesService } from './outcomes.service';
import { OutcomesController } from './outcomes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutcomesEntity } from './entities/outcomes.entity';
import { CardsEntity } from '../cards/entities/cards.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OutcomesEntity, CardsEntity])],
  providers: [OutcomesService],
  controllers: [OutcomesController],
  exports: [OutcomesService],
})
export class OutcomesModule {}
