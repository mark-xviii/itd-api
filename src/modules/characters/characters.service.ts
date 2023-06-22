import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { DataUnitsEnum } from 'src/enums/data-units.enum';
import Utils from 'src/utils';
import { Repository } from 'typeorm';
import { CreateCharacterDTO } from './dtos/create-character.dto';
import { UpdateCharacterDTO } from './dtos/update-character.dto';
import { CharactersEntity } from './entities/characters.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(CharactersEntity)
    private readonly charactersRepository: Repository<CharactersEntity>,
  ) {}

  async getAllCharacters() {
    return await this.charactersRepository.find({});
  }

  async getOneCharacter(characterId: string) {
    return await this.charactersRepository.findOne({
      where: { id: characterId },
    });
  }

  async createCharacter(
    { name, position }: CreateCharacterDTO,
    imageFile: Express.Multer.File,
  ) {
    const uniqueFileName = `${Utils.Crypto.hashify(
      `${Date.now()}${imageFile.originalname}`,
    )}${extname(imageFile.originalname)}`;

    imageFile.filename = uniqueFileName;

    Utils.FileSystem.saveFile(imageFile);

    const newCharacter = await this.charactersRepository
      .create({
        name: name,
        position: position,
        imageLink: uniqueFileName,
      })
      .save();

    return await this.charactersRepository.findOne({
      where: { id: newCharacter.id },
    });
  }

  async updateCharacter(
    characterId: string,
    { name, position }: UpdateCharacterDTO,
    imageFile: Express.Multer.File,
  ) {
    const candidate = await this.charactersRepository.findOne({
      where: { id: characterId },
    });

    if (!candidate) {
      throw new HttpException(
        `Нет персонажа с таким Id! :: ${characterId}`,
        HttpStatus.CONFLICT,
      );
    }

    let newImageFileLink;

    if (imageFile) {
      if (imageFile.size > Utils.Constants.MAX_FILE_SIZE) {
        throw new HttpException(
          `Файл слишком большой по объёму! :: ${
            imageFile.size / DataUnitsEnum.MB
          } МБайт`,
          HttpStatus.CONFLICT,
        );
      }

      const fileExtension = extname(imageFile.originalname);

      if (
        !Utils.Regex.testAtLeastOne(fileExtension, [
          '.jpeg',
          '.jpg',
          '.gif',
          '.png',
          '.webp',
        ])
      ) {
        throw new HttpException(
          `Неподдерживаемый формат файла! (${fileExtension})`,
          HttpStatus.CONFLICT,
        );
      }

      const uniqueFileName = Utils.Crypto.hashify(
        `${imageFile.originalname}${Date.now().toString()}`,
      );

      imageFile.filename = `${uniqueFileName}${extname(
        imageFile.originalname,
      )}`;

      Utils.FileSystem.saveFile(imageFile);

      newImageFileLink = imageFile.filename;
    }

    await this.charactersRepository.update(characterId, {
      ...(name && { name: name }),
      ...(position && { position: position }),
      ...(newImageFileLink && { imageLink: newImageFileLink }),
    });

    return await this.charactersRepository.find({
      where: { id: characterId },
    });
  }

  async deleteCharacter(characterId: string) {
    const candidate = await this.charactersRepository.findOne({
      where: { id: characterId },
    });

    if (!candidate) {
      throw new HttpException(
        `Нет персонажа с таким Id! :: ${characterId}`,
        HttpStatus.CONFLICT,
      );
    }

    return await this.charactersRepository.delete(characterId);
  }
}
