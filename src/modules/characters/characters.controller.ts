import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import Utils from 'src/utils';
import { CharactersService } from './characters.service';
import { CreateCharacterDTO } from './dtos/create-character.dto';
import { UpdateCharacterDTO } from './dtos/update-character.dto';

@Controller('characters')
export class CharactersController {
  constructor(
    @Inject(CharactersService)
    private readonly charactersService: CharactersService,
  ) {}

  @Get('/')
  getCharacters() {
    return this.charactersService.getAllCharacters();
  }

  @Get('/:characterId')
  getOneCharacter(@Param('characterId') characterId: string) {
    return this.charactersService.getOneCharacter(characterId);
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('imageFile'))
  createCharacter(
    @Body() body: CreateCharacterDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: Utils.Constants.MAX_FILE_SIZE }),
          new FileTypeValidator({
            fileType: Utils.Regex.matchAtLeastOne([
              'image/jpeg',
              'image/png',
              'image/webp',
              'image/gif',
            ]),
          }),
        ],
      }),
    )
    imageFile: Express.Multer.File,
  ) {
    return this.charactersService.createCharacter(body, imageFile);
  }

  @Put('/:characterId')
  @UseInterceptors(FileInterceptor('imageFile'))
  updateCharacter(
    @Param('characterId') characterId: string,
    @Body() body: UpdateCharacterDTO,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.charactersService.updateCharacter(characterId, body, imageFile);
  }

  @Delete('/:characterId')
  deleteCharacter(@Param('characterId') characterId: string) {
    return this.charactersService.deleteCharacter(characterId);
  }
}
