'use strict';
const AWS = require('aws-sdk');
const ssm = new AWS.SSM({ apiVersion: '2014-11-06' });
const crypto = require('crypto');
const log = require('./log');
let secret;

module.exports.generateWebhookSecret = () => {
  if (!secret) {
    secret = crypto.randomBytes(20).toString('hex');
  }
  return secret;
}

module.exports.getGitHubAccessToken = () => {
  return getSSMParameter('/GITHUB_TOKEN/frigg-access')
    .then(data => data.Parameter.Value);
}

const getSSMParameter = key => {
  const params = { Name: key, WithDecryption: true }
  log.info('Getting parameter from parameter store with params', params);
  return ssm.getParameter(params).promise();
}