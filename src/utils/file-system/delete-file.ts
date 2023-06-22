const fs = require('fs');

export function deleteFile(filePath: string) {
  fs.unlinkSync(filePath);
}
