'use strict';
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const GHEvent = require('./githubEvent');

module.exports.handler = (event, context, callback) => {
  handleEvent(event)
    .then(response => sendSuccess(callback))
    .catch( err => sendError(callback, err));
};

const handleEvent = event => {
  let ghEvent = new GHEvent(event);
  if (!ghEvent.isValid()) {
    log.trace('Event not a valid GitHub event, rejecting');
    return Promise.reject(new Error('Invalid event'));
  } else if (!ghEvent.isPertinent()) {
    log.trace('Event valid but not relevant, ignoring');
    return Promise.resolve('Event received');
  } else {
    return ghEvent.sendPipelineEvent();
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
