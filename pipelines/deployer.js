'use strict';
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const Bash = require('./bash');

class Deployer {

  constructor(repo) {
    this.directory = `/tmp/repo/${repo.name}`;
    this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    this.exec = require('child_process').exec;
    this.bash = new Bash();
  }

  deploy() {
    log.trace('Deploying pipeline');
    let command = `cd ${this.directory} && export AWS_ACCESS_KEY_ID=${this.AWS_ACCESS_KEY_ID} && export AWS_SECRET_ACCESS_KEY=${this.AWS_SECRET_ACCESS_KEY} && export HOME=/tmp`;
    command += ` && cd ${this.directory}/pipeline && npm i && npm run deploy`;
    return this.bash.execute(command);
  }

  setupDeployEnvironment() {
    log.trace('Setting up deploy environment');
    const command = ``;
    return this.bash.execute(command);
  }

  doDeploy() {
    log.trace('Deploying pipeline');
  }

};

module.exports = Deployer;
