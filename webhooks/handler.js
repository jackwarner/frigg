'use strict';
const PipelineTrigger = require('./pipelineTrigger');
const Validator = require('./validator');
const log = require('../lib/log');

module.exports.github = (event, context, callback) => {
  const validator = new Validator(event);
  if (validator.isPing()) {
    return sendSuccess(callback);
  } else {
    validator.validate()
      .then(res => new PipelineTrigger(event))
      .then(trigger => trigger.send())
      .then(res => sendSuccess(callback))
      .catch(err => sendError(callback, err));
  }
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
