'use strict';
const crypto = require('crypto');

module.exports.handler = (event, context, callback) => {
  console.log('Received event from GitHub', event);
  const secret = 'poop';
  const signature = crypto.createHmac('sha1', secret).update(event.body).digest('hex');
  console.log('secret and signature match', secret === signature);

  callback(null, response);
};
