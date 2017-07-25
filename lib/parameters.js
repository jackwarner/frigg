'use strict';
const AWS = require('aws-sdk');
const ssm = new AWS.SSM({ apiVersion: '2014-11-06' });
const crypto = require('crypto');
const log = require('./log');

module.exports.generateWebhookSecret = () => {
  return crypto.randomBytes(20).toString('hex');
}

module.exports.getGitHubAccessToken = () => {
  return getSSMParameter('/GITHUB_TOKEN/frigg-access')
    .then(parameter => {
      log.info('Got parameter from store: ' + JSON.stringify(parameter));
      log.info('parameter.Value', parameter.Value);
      log.info('parameter.Type', parameter.Type);
      log.info('parameter.Name', parameter.Name);
      return parameter.Value;
    });
}

const getSSMParameter = key => {
  const params = { Name: key, WithDecryption: true }
  log.info('Getting parameter from parameter store with params', params);
  return ssm.getParameter(params).promise();
}