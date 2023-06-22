import { Provider, Scope } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { LocalStrategy } from '../auth/strategies/local.strategy';
import { CardsService } from '../cards/cards.service';
import { CharactersService } from '../characters/characters.service';
import { DecksService } from '../decks/decks.service';
import { OutcomesService } from '../outcomes/outcomes.service';
import { SequencesService } from '../sequences/sequences.service';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';

export const AppProviders: Provider[] = [
  { provide: AuthService, useValue: AuthService },
  { provide: UsersService, useValue: UsersService },
  { provide: CardsService, useValue: CardsService },
  { provide: CharactersService, useValue: CharactersService },
  { provide: SessionsService, useValue: SessionsService },
  { provide: SequencesService, useValue: SequencesService },
  { provide: DecksService, useValue: DecksService },
  { provide: OutcomesService, useValue: OutcomesService },
  { provide: JwtStrategy, useValue: JwtStrategy },
  { provide: LocalStrategy, useValue: LocalStrategy },
  { provide: JwtService, useValue: JwtService },
];
