export function multipleExist(valuesToFind: any[], array: any[]) {
  return valuesToFind.every((value) => {
    return array.includes(value);
  });
}
