'use strict';
const crypto = require('crypto');

module.exports.webhookSecret = () => {
  return crypto.randomBytes(20).toString('hex');
}