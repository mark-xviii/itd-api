import Utils from '..';

export function generatePublicLink(fileName: string) {
  return `${Utils.Constants.API_URL}/${Utils.Constants.FILE_UPLOAD_DESTINATION}/${fileName}`;
}
