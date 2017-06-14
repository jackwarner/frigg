'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });
const Git = require('../vendor/git');
const Repo = require('./repo');
const Pipeline = require('./pipeline');
const log = require('../lib/log');

module.exports.handler = (event, context, callback) => {
  const git = new Git();
  const repo = new Repo(getRepoFromEvent(event));
  git.install()
    .then(res => repo.clone())
    .then(res => new Pipeline(repo))
    .then(pipeline => pipeline.deploy())
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

const getRepoFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message);
};
