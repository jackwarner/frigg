'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const Bash = require('../lib/bash');
const log = require('../lib/log');

class Pipeline {

  constructor(config) {
    log.info('Creating pipeline from config', config);
    this.config = config;
    this.templateDirectory = `pipelines/templates/${config.pipeline.name}/v${config.pipeline.version}`;
    this.tempDirectory = `/tmp/pipeline`;
    this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    this.bash = new Bash();
  }

  deploy() {
    log.info('Deploying pipeline');
    let command = `cp ${this.templateDirectory} -R ${this.tempDirectory}/ && chmod -R 777 ${this.tempDirectory}`;
    command += ` && cd ${this.tempDirectory} && export AWS_ACCESS_KEY_ID=${this.AWS_ACCESS_KEY_ID} && export AWS_SECRET_ACCESS_KEY=${this.AWS_SECRET_ACCESS_KEY} && export HOME=${this.tempDirectory} && export STAGE=${this.config.pipeline.stage} && export PIPELINE_SERVICE_NAME=${this.config.pipeline.serviceName} && export REPO_NAME=${this.config.repository.fullyQualifiedName}`;
    command += ` && npm i && npm run deploy`;
    return this.bash.execute(command);
  }

  remove() {
    log.info('Removing pipeline');
    const params = {
      Message: JSON.stringify({
        stack: this.config.pipeline.stackName
      }),
      TopicArn: process.env.ODIN_REMOVE_STACK_TOPIC
    };
    log.info('Sending remove pipeline request with params', params);
    return sns.publish(params).promise();
  }

};

module.exports = Pipeline;
