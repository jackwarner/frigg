'use strict';
const crypto = require('crypto');

module.exports.generateWebhookSecret = () => {
  return crypto.randomBytes(20).toString('hex');
}