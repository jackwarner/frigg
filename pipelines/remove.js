'use strict';
const AWS = require('aws-sdk');
const Config = require('./config');
const Pipeline = require('./pipeline');

module.exports.handler = (event, context, callback) => {
  const config = new Config(getRepositoryFromEvent(event));
  const pipeline = new Pipeline(config);
  pipeline.remove()
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

const getRepositoryFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message);
};
