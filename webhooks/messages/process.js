'use strict';
const Message = require('./message');
const log = require('../../utils/log');

module.exports.github = (event, context, callback) => {
  const message = new Message(event);
  message.handle()
    .then(res => sendSuccess(callback))
    .catch(err => sendError(callback, err));
}

const sendSuccess = callback => {
  log.info('Successfully processed message');
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ message: 'Received event' }),
  };
  return callback(null, response);
}

const sendError = (callback, err) => {
  log.error('Error processing message', err);
  return callback(err);
}
