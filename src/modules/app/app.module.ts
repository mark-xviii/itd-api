import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CardsModule } from '../cards/cards.module';
import { CardsEntity } from '../cards/entities/cards.entity';
import { CharactersModule } from '../characters/characters.module';
import { CharactersEntity } from '../characters/entities/characters.entity';
import { DecksModule } from '../decks/decks.module';
import { DecksEntity } from '../decks/entities/decks.entity';
import { OutcomesEntity } from '../outcomes/entities/outcomes.entity';
import { OutcomesModule } from '../outcomes/outcomes.module';
import { SequencesEntity } from '../sequences/entities/sequences.entity';
import { SequencesModule } from '../sequences/sequences.module';
import { SessionsEntity } from '../sessions/entities/sessions.entity';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersEntity } from '../users/entities/users.entity';
import { UsersModule } from '../users/users.module';
import { AppProviders } from './app.providers';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      synchronize: true,
      entities: [
        UsersEntity,
        CardsEntity,
        SessionsEntity,
        OutcomesEntity,
        CharactersEntity,
        SequencesEntity,
        DecksEntity,
      ],
    }),
    AuthModule,
    UsersModule,
    CardsModule,
    SessionsModule,
    CharactersModule,
    SequencesModule,
    DecksModule,
    OutcomesModule,
  ],
  providers: AppProviders,
  exports: AppProviders,
})
export class AppModule {}
