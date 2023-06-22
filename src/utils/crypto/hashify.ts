const crypto = require('crypto');

export function hashify(value: any) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}
