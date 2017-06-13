'use strict';
const Payload = require('./payload');
const EventType = require('./eventType');
const log = require('winston');
log.level = process.env.LOG_LEVEL;

module.exports.handler = (event, context, callback) => {
  const eventType = new EventType(event);
  sendSuccess(callback);
  // handleEvent(event)
  //   .then(response => sendSuccess(callback))
  //   .catch( err => sendError(callback, err));
};

const handleEvent = event => {
  let payload = new Payload(event);
  if (!payload.isValid()) {
    log.info('Event not a valid GitHub event, rejecting');
    return Promise.reject(new Error('Invalid event'));
  } else if (!payload.isPertinent()) {
    log.info('Event valid but not relevant, ignoring');
    return Promise.resolve('Event received');
  } else {
    return payload.processEvent();
  }
};

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
};

const sendError = (callback, err) => {
  log.error('Error processing message', err);
  return callback(err);
};
