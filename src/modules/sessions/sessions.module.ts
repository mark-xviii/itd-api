import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsEntity } from './entities/sessions.entity';
import { UsersModule } from '../users/users.module';
import { DecksModule } from '../decks/decks.module';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    DecksModule,
    UsersModule,
    TypeOrmModule.forFeature([SessionsEntity]),
  ],
  providers: [SessionsService],
  controllers: [SessionsController],
})
export class SessionsModule {}
