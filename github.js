'use strict';
const crypto = require('crypto');
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

module.exports.handler = (event, context, callback) => {
  log.info('Received event from GitHub', event);
  if (!validEvent(event.headers) || !validSignature(event.headers, event.body)) {
    return callback(new Error('[401] Invalid event'));
  }

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!'
    }),
  };

  callback(null, response);
};

const validEvent = headers => {
  console.trace('Headers', headers);
  return headers['X-Hub-Signature']
      && headers['X-GitHub-Event']
      && headers['X-GitHub-Delivery'];
};

const validSignature = (headers, body) => {
  log.trace('Supplied signature', headers['X-Hub-Signature']);
  log.trace('Computed signature', signature);
  return headers['X-Hub-Signature'] === signRequestBody(body);
};

const signRequestBody = body => {
  const signature = crypto.createHmac('sha1', process.env.GITHUB_WEBHOOK_SECRET)
                          .update(JSON.stringify(body), 'utf-8')
                          .digest('hex');
  return `sha1=${signature}`;
};
