'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const crypto = require('crypto');
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const GHEvent = require('./event');

module.exports.handler = (event, context, callback) => {
  let ghEvent = new GHEvent(event, process.env.GITHUB_WEBHOOK_SECRET);
  isValidEvent(ghEvent)
    .then(filterEvent)
    .then(sendEvent)
    .then(response => sendSuccess(callback))
    .catch( err => sendError(callback, err));
};

const isValidEvent = event => {
  return new Promise( (resolve, reject) => {
    event.isValid() ? resolve(event) : reject(new Error('Invalid event'));
  });
};

const filterEvent = event => {
  return new Promise( (resolve, reject) => {
    event.isPertinent() ? resolve(event) : resolve({});
  });
};

const sendEvent = event => {
  if (event && event.shouldCreatePipeline()) {
    return sendCreatePipelineEvent(event.getBody());
  } else if (event && event.shouldUpdatePipeline()) {
    return sendUpdatePipelineEvent(event.getBody());
  } else if (event && event.shouldRemovePipeline()) {
    return sendRemovePipelineEvent(event.getBody());
  } 
};

const sendCreatePipelineEvent = body => {
  const params = {
    Message: JSON.stringify({
      repository: {
        name: body.repository.name,
        qualifiedName: body.repository.full_name,
        owner: body.repository.owner.login,
        api: body.repository.url,
        html: body.repository.html_url,
        created: body.repository.created_at,
        updated: body.repository.updated_at
      },
      branch: {

      }
    }),
    TopicArn: process.env.CREATE_PIPELINE_TOPIC
  };
  log.trace('Sending create pipeline event with params', params);
  return sns.publish(params).promise();
};

const sendUpdatePipelineEvent = event => {
  const params = {
    Message: JSON.stringify({
      test: "test"
    }),
    TopicArn: process.env.UPDATE_PIPELINE_TOPIC
  };
  log.trace('Sending update pipeline event with params', params);
  return sns.publish(params).promise();
};

const sendRemovePipelineEvent = event => {
  const params = {
    Message: JSON.stringify({
      test: "test"
    }),
    TopicArn: process.env.REMOVE_PIPELINE_TOPIC
  };
  log.trace('Sending remove pipeline event with params', params);
  return sns.publish(params).promise();
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
  log.error('Unexpected error', err);
  return callback(err);
};
