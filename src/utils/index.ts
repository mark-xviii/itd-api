import { hashify } from './crypto/hashify';
import { saveFile } from './file-system/write-file';
import { transformToNumberUtil } from './transformers/transform-to-number.util';
import { transformToStringUtil } from './transformers/transform-to-string.util';
import { matchAtLeastOne } from './regex/match-at-least-one';
import { Constants } from './constants';
import { generatePublicLink } from './string-formatting/generate-upload-link';
import { testAtLeastOne } from './regex/test-at-least-one';
import { BaseEntityExtended } from './db-entities/base.entity';
import { deleteFile } from './file-system/delete-file';
import { shuffle } from './random/shuffle';
import { multipleExist } from './array/multiple-exist';

const Utils = {
  DatabaseEntities: {
    BaseEntityExtended,
  },
  StringFormatting: {
    generatePublicLink,
  },
  Crypto: {
    hashify,
  },
  Transform: {
    transformToNumberUtil,
    transformToStringUtil,
  },
  FileSystem: {
    deleteFile,
    saveFile,
  },
  Regex: {
    matchAtLeastOne,
    testAtLeastOne,
  },
  Random: {
    shuffle,
  },
  Array: {
    multipleExist,
  },
  Constants,
};

export default Utils;
