'use strict';
const fs = require('fs');
const path = require('path');
const tar = require('tar-fs');
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const Bash = require('../lib/bash');
const Deployer = require('./deployer');

class Repo {
  constructor(repo) {
    this.directory = '/tmp/repo';
    this.branch = repo.branch;
    this.owner = repo.owner;
    this.name = repo.name;
    this.token = process.env.GITHUB_TOKEN;
    this.bash = new Bash();
    this.deployer = new Deployer(repo);
  }

  clone() {
    return this.cleanDirectory()
              .then(() => this.doClone());
  }

  cleanDirectory() {
    log.trace('Cleaning repository directory');
    const command = `rm -rf ${this.directory} && mkdir -p ${this.directory}`;
    return this.bash.execute(command);
  }

  doClone() {
    log.trace('Cloning repository');
    const command = `cd ${this.directory} && git clone -b ${this.branch} --single-branch --depth 1 https://${this.token}@github.com/${this.owner}/${this.name}.git`; 
    return this.bash.execute(command);
  }

  deploy() {
    return this.deployer.deploy();
  }

  publishStackName(deployOutput) {
    return this.getStackInfo()
                .then(res => this.getStackName(res));
//     log.trace('Received output from stack deploy', deployOutput);

//     const command = `x=$'Service Information
// service: frigg
// stage: local
// region: us-east-1
// api keys:
//   None
// endpoints:
//   POST - https://dcjwa5u3rk.execute-api.us-east-1.amazonaws.com/local/github
// functions:
//   GitHubEventHandler: frigg-local-GitHubEventHandler
//   UpsertPipeline: frigg-local-UpsertPipeline
//   RemovePipeline: frigg-local-RemovePipeline'
// readarray -t y <<<"$x"

// servicekeyvalue=\${y[1]}
// stagekeyvalue=\${y[2]}

// IFS=': ' read -r -a servicearray <<< "$servicekeyvalue"
// IFS=': ' read -r -a stagearray <<< "$stagekeyvalue"

// echo "\${servicearray[1]}"-"\${stagearray[1]}"`;
//     return this.bash.execute(command);
  }

  getStackInfo() {
    const command = `cd /tmp/repo/${this.name} $$ export HOME=/tmp && export STAGE=${this.branch} && cd pipeline && npm run info`;
    return this.bash.execute(command);
  }

  getStackName(stackInfo) {
    log.trace('Received stack info', stackInfo);
    const command = `x=$'${stackInfo}'
readarray -t y <<<"$x"

servicekeyvalue=\${y[4]}
stagekeyvalue=\${y[5]}

IFS=': ' read -r -a servicearray <<< "$servicekeyvalue"
IFS=': ' read -r -a stagearray <<< "$stagekeyvalue"

echo "\${servicearray[1]}"-"\${stagearray[1]}"`;
    return this.bash.execute(command);
  }

};

module.exports = Repo;
