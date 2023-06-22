import { Module } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { CharactersEntity } from './entities/characters.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CharactersEntity])],
  providers: [CharactersService],
  controllers: [CharactersController],
  exports: [CharactersService],
})
export class CharactersModule {}
