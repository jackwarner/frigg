'use strict';
const https = require('https');
const url = require('url');
const GitHubApi = require('github');
const log = require('../lib/log');

module.exports.manage = (event, context, callback) => {
  log.info('Receiving event for github management', event);
  log.info('Request type', event.RequestType);

  if (event.RequestType === 'Delete') {
    remove()
      .then(response => sendResponse(event, context, 'SUCCESS'))
      .catch(response => sendResponse(event, context, 'FAILED'));
  }

  if (event.RequestType === 'Create') {
    register()
      .then(response => sendResponse(event, context, 'SUCCESS'))
      .catch(response => sendResponse(event, context, 'FAILED'));
  }

  if (event.RequestType === 'Update') {
    sendResponse(event, context, 'SUCCESS')
  } 
}

const register = () => {
  return new Promise( (resolve, reject) => {
    const github = new GitHubApi();
    github.authenticate({
      type: 'token',
      token: process.env.GITHUB_TOKEN
    });
    const params = {
      org: 'santaswap',
      name: 'web',
      config: {
        url: process.env.WEBHOOK_HANDLER_URL,
        secret: process.env.GITHUB_WEBHOOK_SECRET
      },
      events: [ 'delete', 'create', 'push', 'repository' ]
    };
    log.info('Creating webhook with params', params);
    github.orgs.createHook(params, (err, res) => {
      if (err) {
        log.error('Error creating webhook', err);
        reject(err);
      } else {
        log.info('Successfully created webhook', res)
        resolve('Successfully created webhook');
      }
    });
  });
}

const remove = () => {
  return Promise.resolve();
}

const sendResponse = (event, context, responseStatus, responseData) => {
  const responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: 'Details in CloudWatch Log Stream: ' + context.logStreamName,
    PhysicalResourceId: context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData
  });

  const parsedUrl = url.parse(event.ResponseURL);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'PUT',
    headers: {
      'content-type': '',
      'content-length': responseBody.length
    }
  };
  
  log.info('Sending request with options', options);
  let request = https.request(options, response => {
    log.info('Status response', response.statusCode);
    log.info('Status headers', response.headers);
    context.done();
  });

  request.on('error', error => {
    log.error('Error sending custom resource stack status', error);
    context.done();
  });

  log.info('Writing response body', responseBody);
  request.write(responseBody);
  request.end();
}
