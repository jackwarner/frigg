'use strict';
const AWS = require('aws-sdk');
const Build = require('./build');

module.exports.pipelineAdded = (event, context, callback) => {
  const build = new Build(getBuildFromEvent(event));
  build.savePipeline()
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

module.exports.pipelineRemoved = (event, context, callback) => {
  const build = new Build(getBuildFromEvent(event));
  build.removePipeline()
    // .then(res => build.removeBuilds())
    .then(res => callback(null, res))
    .catch(err => callback(err));
};

module.exports.buildStarted = (event, context, callback) => {
  // TODO update pipeline record to show build in progress
  // TODO add build record with in progress
}

module.exports.buildFinished = (event, context, callback) => {
  // TODO update pipeline record to show build complete with status
  // TODO update build record with build status
}

const getBuildFromEvent = event => {
  return JSON.parse(event.Records[0].Sns.Message);
};
