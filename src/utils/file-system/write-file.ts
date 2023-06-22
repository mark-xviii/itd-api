const fs = require('fs');
import Utils from '..';

function writeFile(file: Express.Multer.File) {
  return fs.writeFileSync(
    `${Utils.Constants.FILE_UPLOAD_DESTINATION}/${file.filename}`,
    file.buffer,
  );
}

export function saveFile(file: Express.Multer.File) {
  if (fs.existsSync(Utils.Constants.FILE_UPLOAD_DESTINATION)) {
    return writeFile(file);
  } else {
    fs.mkdirSync(Utils.Constants.FILE_UPLOAD_DESTINATION, '0744');
    return writeFile(file);
  }
}
