'use strict';
const Config = require('./config');
const Pipeline = require('./pipeline');

module.exports.upsert = (event, context, callback) => {
  const config = new Config(getRepositoryFromEvent(event));
  config.loadConfig()
    .then(res => new Pipeline(config))
    .then(pipeline => pipeline.deploy())
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

module.exports.removePipeline = (event, context, callback) => {
  const config = new Config(getRepositoryFromEvent(event));
  const pipeline = new Pipeline(config);
  pipeline.remove()
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

module.exports.removeRepository = (event, context, callback) => {
  const config = new Config(getRepositoryFromEvent(event));
  const pipeline = new Pipeline(config);
  pipeline.removeRepository()
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

const getRepositoryFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message);
};
