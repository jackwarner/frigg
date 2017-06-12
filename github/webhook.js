'use strict';
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const Payload = require('./payload');
const EventType = require('./eventType');

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
    log.trace('Event not a valid GitHub event, rejecting');
    return Promise.reject(new Error('Invalid event'));
  } else if (!payload.isPertinent()) {
    log.trace('Event valid but not relevant, ignoring');
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
