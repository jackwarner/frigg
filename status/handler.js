'use strict';
const AWS = require('aws-sdk');
const Pipeline = require('./pipeline');

module.exports.pipelineAdded = (event, context, callback) => {
  const pipeline = new Pipeline(getPipelineFromEvent(event));
  pipeline.save()
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

module.exports.pipelineRemoved = (event, context, callback) => {
  const pipeline = new Pipeline(getPipelineFromEvent(event));
  const build = new Build(getBuildFromEvent(event));
  Promise.all([pipeline.remove(), build.removeAll()])
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

module.exports.buildStarted = (event, context, callback) => {
  const build = new Build(getBuildFromEvent(event));
  build.saveStartedStatus()
    .then(res => callback(null, res))
    .catch(err => callback(err));
}

module.exports.buildFinished = (event, context, callback) => {
  const build = new Build(getBuildFromEvent(event));
  build.saveFinishedStatus()
    .then(res => callback(null, res))
    .catch(err => callback(err));
}

const getBuildFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message);
};

const getPipelineFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message);
};
