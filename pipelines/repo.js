'use strict';
const fs = require('fs');
const path = require('path');
const tar = require('tar-fs');
const Bash = require('../lib/bash');
const yaml = require('js-yaml');
const log = require('../lib/log');

class Repo {
  constructor(repo) {
    this.directory = '/tmp/repo';
    this.branch = repo.branch;
    this.owner = repo.owner;
    this.name = repo.name;
    this.token = process.env.GITHUB_TOKEN;
    this.bash = new Bash();
    this.pipeline = {};
  }

  clone() {
    return this.cleanDirectory()
              .then(() => this.doClone())
              .then(() => this.setFriggProperties());
  }

  cleanDirectory() {
    log.info('Cleaning repository directory');
    const command = `rm -rf ${this.directory} && mkdir -p ${this.directory}`;
    return this.bash.execute(command);
  }

  doClone() {
    log.info('Cloning repository');
    const command = `cd ${this.directory} && git clone -b ${this.branch} --single-branch --depth 1 https://${this.token}@github.com/${this.owner}/${this.name}.git`; 
    return this.bash.execute(command);
  }

  setFriggProperties() {
    log.info('Getting Frigg properties');
    let config = yaml.safeLoad(fs.readFileSync(`${this.directory}/${this.name}/frigg.yml`, 'utf8'));
    this.pipeline = config.pipeline;
    return Promise.resolve(config);
  }

};

module.exports = Repo;
