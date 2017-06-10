'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const Bash = require('../lib/bash');

class Pipeline {

  constructor(repo) {
    log.trace('Creating pipeline class for repo', repo);
    this.pipelineServiceName = this.getPipelineServiceName(repo);
    this.stage = this.getStage(repo.branch);
    this.deployedPipelineName = this.getDeployedPipelineName(this.pipelineServiceName, this.stage);
    this.templateDirectory = `pipelines/templates/${repo.pipeline.name}/v${repo.pipeline.version}`;
    this.tempDirectory = `/tmp/pipeline`;
    this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    this.bash = new Bash();
  }

  deploy() {
    log.trace('Deploying pipeline');
    let command = `cp ${this.templateDirectory} -R ${this.tempDirectory}/ && chmod -R 777 ${this.tempDirectory}`;
    command += ` && cd ${this.tempDirectory} && export AWS_ACCESS_KEY_ID=${this.AWS_ACCESS_KEY_ID} && export AWS_SECRET_ACCESS_KEY=${this.AWS_SECRET_ACCESS_KEY} && export HOME=${this.tempDirectory} && export STAGE=${this.stage} && export PIPELINE_SERVICE_NAME=${this.pipelineServiceName}`;
    command += ` && npm i && npm run deploy`;
    return this.bash.execute(command);
  }

  remove() {
    log.trace('Removing pipeline');
    const params = {
      Message: JSON.stringify({
        stack: this.deployedPipelineName
      }),
      TopicArn: process.env.ODIN_REMOVE_STACK_TOPIC
    };
    log.trace('Sending remove pipeline request with params', params);
    return sns.publish(params).promise();
  }

  getPipelineServiceName(repo) {
    return `${repo.owner}-${repo.name}-pipeline`;
  }

  getStage(branch) {
    return branch.toUpperCase() === 'MASTER' ? 'prod' : branch;
  }

  getDeployedPipelineName(serviceName, stage) {
    return `${serviceName}-${stage}`;
  }

};

module.exports = Pipeline;
