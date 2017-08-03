'use strict';
const https = require('https');
const url = require('url');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const GitHubApi = require('github');
const parameters = require('../lib/parameters');
const log = require('../lib/log');

const CONFIG_KEY = 'github-webhook-config.json';

module.exports.manage = (event, context, callback) => {
  log.info('Receiving event for github management', event);
  log.info('Request type', event.RequestType);

  if (event.RequestType === 'Delete') {
    Promise.all([getWebhookConfig(), parameters.getGitHubAccessToken()])
      .then(removeWebhook)
      .then(emptyConfigBucket)
      .then(response => sendCloudFormationResponse(event, context, 'SUCCESS'))
      .catch(error => sendCloudFormationResponse(event, context, 'FAILED', error));
  }

  if (event.RequestType === 'Create') {
    parameters.getGitHubAccessToken()
      .then(registerWebhook)
      .then(saveWebookConfig)
      .then(response => sendCloudFormationResponse(event, context, 'SUCCESS'))
      .catch(error => sendCloudFormationResponse(event, context, 'FAILED', error));
  }

  if (event.RequestType === 'Update') {
    Promise.all([getWebhookConfig(), parameters.getGitHubAccessToken()])
      .then(updateWebhook)
      .then(response => sendCloudFormationResponse(event, context, 'SUCCESS'))
      .catch(error => sendCloudFormationResponse(event, context, 'FAILED', error));
  } 
}

const registerWebhook = githubToken => {
  return new Promise( (resolve, reject) => {
    const github = new GitHubApi();
    github.authenticate({
      type: 'token',
      token: githubToken
    });
    const params = {
      org: 'santaswap',
      name: 'web',
      config: {
        url: process.env.WEBHOOK_HANDLER_URL,
        secret: process.env.GITHUB_WEBHOOK_SECRET,
        content_type: 'json'
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
        resolve(res);
      }
    });
  });
}

const removeWebhook = values => {
  let config = values[0];
  const githubToken = values[1];
  return new Promise( (resolve, reject) => {
    const github = new GitHubApi();
    github.authenticate({
      type: 'token',
      token: githubToken
    });
    config = JSON.parse(config.Body.toString('utf-8'));
    log.info('Parsed webhook config', config);
    const params = {
      org: 'santaswap',
      id: config.data.id,
    };
    log.info('Removing webhook with params', params);
    github.orgs.deleteHook(params, (err, res) => {
      if (err) {
        log.error('Error removing webhook', err);
        reject(err);
      } else {
        log.info('Successfully removed webhook', res);
        resolve(res);
      }
    });
  });
}

const updateWebhook = values => {
  let config = values[0];
  const githubToken = values[1];
  return new Promise( (resolve, reject) => {
    const github = new GitHubApi();
    github.authenticate({
      type: 'token',
      token: githubToken
    });
    config = JSON.parse(config.Body.toString('utf-8'));
    log.info('Parsed webhook config', config);
    const params = {
      config: {
        url: process.env.WEBHOOK_HANDLER_URL,
        secret: process.env.GITHUB_WEBHOOK_SECRET,
        content_type: 'json'
      }
    };
    log.info('Updating webhook with params', params);
    github.orgs.editHook('santaswap', config.data.id, config, (err, res) => {
      if (err) {
        log.error('Error updating webhook', err);
      } else {
        log.info('Successfully updated webhook', res);
        resolve(res);
      }
    });
  });
}

const saveWebookConfig = response => {
  const params = {
    Body: JSON.stringify(response),
    Bucket: process.env.FRIGG_CONFIG_BUCKET,
    Key: CONFIG_KEY
  };
  log.info('Saving webhook config with params', params);
  return s3.putObject(params).promise();
}

const getWebhookConfig = () => {
  const params = {
    Bucket: process.env.FRIGG_CONFIG_BUCKET,
    Key: CONFIG_KEY
  };
  log.info('Getting webhook config with params', params);
  return s3.getObject(params).promise();
}

const emptyConfigBucket = () => {
  return listBucketObjects().then(deleteObjects);
}

const listBucketObjects = () => {
  const params = { Bucket: process.env.FRIGG_CONFIG_BUCKET };
  log.debug('Listing objects with params', params);
  return s3.listObjectsV2(params).promise();
};

const deleteObjects = objects => {
  const params = {
    Bucket: process.env.FRIGG_CONFIG_BUCKET,
    Delete: {
      Objects: objects.Contents.map( object => { return { Key: object.Key } })
    }
  };
  log.debug('Deleting objects with params', params);
  return s3.deleteObjects(params).promise();
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
}
