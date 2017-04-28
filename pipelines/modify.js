'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const Git = require('../vendor/git');
const Repo = require('./repo');

module.exports.handler = (event, context, callback) => {
  const git = new Git();
  const repo = new Repo(getRepoFromEvent(event));
  git.install()
    .then(res => repo.clone())
    .then(res => repo.deploy())
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

const getRepoFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message).repository;
};
