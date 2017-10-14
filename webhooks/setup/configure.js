'use strict';
const https = require('https');
const url = require('url');
const Webhook = require('./webhook');
const log = require('../../lib/log');

const CONFIG_KEY = 'github-webhook-config.json';

module.exports.github = (event, context) => {
  log.info('Receiving event for github configuration', event);
  log.info('Request type', event.RequestType);

  let webhook = new Webhook(event);
  webhook.configure()
    .then(res => sendCloudFormationResponse(event, context, res.message, res.err))
    .catch(res => sendCloudFormationResponse(event, context, res.message, res.err))
};

const sendCloudFormationResponse = (event, context, responseStatus, responseData) => {
  if (responseData) {
    log.info('Sending response data (usually error message)', responseData);
  }

  const responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: responseData ? JSON.stringify(responseData) : responseStatus,
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
};
