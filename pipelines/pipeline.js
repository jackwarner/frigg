'use strict';
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const Bash = require('../lib/bash');

class Pipeline {

  constructor(repo) {
    this.repo = repo;
    this.pipelineServiceName = `${repo.name}-pipeline-${repo.branch}`;
    this.templateDirectory = `pipelines/templates/${repo.pipeline.name}/v${repo.pipeline.version}`;
    this.tempDirectory = `/tmp/pipeline`;
    this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    this.bash = new Bash();
  }

  deploy() {
    log.trace('Deploying pipeline');
    let command = `cp ${this.templateDirectory} -R ${this.tempDirectory}/ && chmod -R 777 ${this.tempDirectory}`;
    command += ` && cd ${this.tempDirectory} && export AWS_ACCESS_KEY_ID=${this.AWS_ACCESS_KEY_ID} && export AWS_SECRET_ACCESS_KEY=${this.AWS_SECRET_ACCESS_KEY} && export HOME=${this.tempDirectory} && export STAGE=${this.repo.branch} && export PIPELINE_SERVICE_NAME=${this.pipelineServiceName}`;
    command += ` && npm i && npm run deploy`;
    return this.bash.execute(command);
  }

};

module.exports = Pipeline;
