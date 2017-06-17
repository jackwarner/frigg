'use strict';
const yaml = require('js-yaml');
const GitHub = require('github-api');
const log = require('../lib/log');

class Config {
  constructor(repository) {
    log.info('Creating config for repository', repository);
    this.repository = {
      branch: repository.branch,
      owner: repository.owner,
      name: repository.name,
      fullyQualifiedName: this.getFullyQualifiedRepositoryName(repository)
    }
    this.pipeline = {
      serviceName: this.getPipelineServiceName(),
      stackName: this.getPipelineStackName(),
      stage: this.getPipelineStage()
    };
  }

  getConfig() {
    log.info('Getting frigg config properties');
    let pipeline = this.pipeline;
    const github = new GitHub({ token: process.env.GITHUB_TOKEN });
    let repository = github.getRepo(this.repository.owner, this.repository.name);
    return new Promise( (resolve, reject) => {
      repository.getContents(this.repository.branch, 'frigg.yml', true, (err, data) => {
        if (err) {
          log.error('Error getting frigg config from repository', err);
          reject(err);
        } else {
          log.info('Got frigg config', data);
          let config = yaml.safeLoad(data);
          pipeline = Object.assign(pipeline, config.pipeline);
          resolve(config);
        }
      });
    });
  }

  getFullyQualifiedRepositoryName(repository) {
    return `${repository.owner}-${repository.name}`;
  }

  getPipelineStage() {
    return this.repository.branch.toUpperCase() === 'MASTER' ? 'prod' : this.repository.branch.toLowerCase();
  }

  getPipelineServiceName() {
    return `${this.repository.owner}-${this.repository.name}-pipeline`;
  }

  getPipelineStackName() {
    return `${this.getPipelineServiceName()}-${this.getPipelineStage()}`;
  }

};

module.exports = Config;
