'use strict';
const yaml = require('js-yaml');
const GitHub = require('github-api');
const parameters = require('../utils/parameters');
const log = require('../utils/log');

class Config {
  constructor(repository) {
    log.info('Creating config for repository', repository);
    this.repository = {
      branch: repository.branch,
      owner: repository.owner,
      name: repository.name,
      fullyQualifiedName: this.getFullyQualifiedRepositoryName(repository)
    }
    if (repository.branch) {
      this.pipeline = {
        serviceName: this.getPipelineServiceName(),
        stackName: this.getPipelineStackName(),
        stage: this.getPipelineStage()
        // properties from frigg.yml are added here in getConfig() below
      };
    }
  }

  loadConfig() {
    log.info('Getting frigg config properties');
    return parameters.getGitHubAccessToken()
      .then(token => this.configureGitHub(token))
      .then(github => this.getConfig(github))
      .then(config => this.setConfig(config));
  }

  configureGitHub(githubToken) {
    const github = new GitHub({ token: githubToken });
    return Promise.resolve(github)
  }

  getConfig(github) {
    const repo = this.repository;
    log.info('Getting frigg config for repository', repo)
    let remote = github.getRepo(repo.owner, repo.name);
    return new Promise( (resolve, reject) => {
      remote.getContents(repo.branch, 'frigg.yml', true, (err, data) => {
        if (err) {
          log.error('Error getting frigg config from repository', err);
          reject(err);
        } else {
          log.info('Got frigg config', data);
          resolve(data);
        }
      });
    });
  }

  setConfig(data) {
    let pipeline = this.pipeline;
    const config = yaml.safeLoad(data);
    this.pipeline = Object.assign(this.pipeline, config.pipeline);
    return Promise.resolve();
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
