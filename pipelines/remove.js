'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const Repo = require('./repo');
const Pipeline = require('./pipeline');

module.exports.handler = (event, context, callback) => {
  const repo = new Repo(getRepoFromEvent(event));
  const pipeline = new Pipeline(repo);
    pipeline.remove()
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

const getRepoFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message);
};