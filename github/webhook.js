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

// TODO this is getting disgusting, clean up this whole file - how use objects around github events?
// TODO could be create new pipeline on push, if repo didn't have build spec when first created or any time until this push
// TODO should this lambda be determining the create vs update, or calling an upsert and deferring to another lambda?
const sendEvent = event => {
  if (event && event.shouldCreatePipeline()) {
    return sendCreatePipelineEvent(body);
  } else if (event && event.shouldUpdatePipeline()) {
    return sendUpdatePipelineEvent(body);
  } else if (event && event.shouldRemovePipeline()) {
    return sendRemovePipelineEvent(body);
  } 
};

const sendCreatePipelineEvent = body => {
  const params = {
    Message: JSON.stringify({
      repository: {
        name: body.repository.name,
        qualifiedName: body.repository.full_name,
        url: body.repository.url,
        htmlUrl: body.repository.html_url,
        created: body.repository.created_at,
        updated: body.repository.updated_at
      }

    }),
    TopicArn: process.env.CREATE_PIPELINE_TOPIC
  };
  return sns.publish(params).promise();
};

const sendUpdatePipelineEvent = event => {
  const params = {
    Message: JSON.stringify({

    }),
    TopicArn: process.env.UPDATE_PIPELINE_TOPIC
  };
  return sns.publish(params).promise();
};

const sendRemovePipelineEvent = event => {
  const params = {
    Message: JSON.stringify({

    }),
    TopicArn: process.env.REMOVE_PIPELINE_TOPIC
  };
  return sns.publish(params).promise();
};

const hasValidHeaders = headers => {
  const validHeaders = headers['X-Hub-Signature']
                    && headers['X-GitHub-Event']
                    && headers['X-GitHub-Delivery'];
  log.trace('Has valid headers:', validHeaders);
  return validHeaders;
};

const hasValidSignature = (headers, body) => {
  const signature = signRequestBody(body);
  log.trace('Supplied signature', headers['X-Hub-Signature']);
  log.trace('Computed signature', signature);
  const validSignature = headers['X-Hub-Signature'] === signature;
  log.trace('Has valid signature', validSignature);
  return validSignature;
};

const signRequestBody = body => {
  const signature = crypto.createHmac('sha1', process.env.GITHUB_WEBHOOK_SECRET)
                          .update(body, 'utf-8')
                          .digest('hex');
  return `sha1=${signature}`;
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
