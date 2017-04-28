'use strict';
const fs = require('fs');
const path = require('path');
const tar = require('tar-fs');
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });
const Bash = require('./bash');
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

};

module.exports = Repo;
