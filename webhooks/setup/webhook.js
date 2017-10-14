'use strict';
const GitHubApi = require('github');
const Config = require('./config');
const parameters = require('../../lib/parameters');
const log = require('../../lib/log');

class Webhook {

    constructor(event) {
      this.event = event;
      this.requestType = event.RequestType;
      this.GITHUB_WEBHOOK_SECRET = event.GITHUB_WEBHOOK_SECRET;
    }

    configure() {
      if (this.shouldRemove()) {
        return this.remove();
      } else if (this.shouldDoNothing()) {
        return this.doNothing();
      } else if (this.shouldRegister()) {
        return this.register();
      } else if (this.shouldUpdate()) {
        return this.update();
      }
    }
    
    shouldRemove() {
      return this.requestType === 'Delete' && process.env.GITHUB_WEBHOOK_SECRET === this.GITHUB_WEBHOOK_SECRET;
    }
    
    remove() {
      log.info('Removing webhook');
      let config = new Config();
      return Promise.all([config.get(), parameters.getGitHubAccessToken()])
        .then(res => {
          const configuration = res[0], githubToken = res[1];
          return this.doRemove(configuration, githubToken);
        })
        .then(res => config.emptyBucket())
        .then(res => this.reportStatus())
        // Don't put the entire stack in a bad state due to a failed delete or update elsewhere
        .catch(err => this.reportStatus());
    }

    doRemove(config, githubToken) {
      return new Promise( (resolve, reject) => {
        const github = new GitHubApi();
        github.authenticate({
          type: 'token',
          token: githubToken
        });
        const params = {
          org: process.env.GITHUB_ORGANIZATION,
          id: config.data.id,
        };
        log.info('Removing webhook with params', params);
        github.orgs.deleteHook(params, (err, res) => {
          if (err) {
            log.error('Error removing webhook', err);
            reject(err);
          } else {
            log.info('Successfully removed webhook', res);
            resolve(res);
          }
        });
      });
    }

    shouldDoNothing() {
      return this.requestType === 'Delete' && process.env.GITHUB_WEBHOOK_SECRET !== this.GITHUB_WEBHOOK_SECRET;
    }

    doNothing() {
      log.info('Not doing anything to webhook');
      return this.reportStatus();
    }
    
    shouldRegister() {
      return this.requestType === 'Create';
    }

    register() {
      log.info('Registering webhook');
      let config = new Config();
      return parameters.getGitHubAccessToken()
        .then(githubToken => this.doRegister(githubToken))
        .then(res => config.save(res))
        .then(res => this.reportStatus())
        .catch(err => this.reportStatus(err));
    }
    
    doRegister(githubToken) {
      return new Promise( (resolve, reject) => {
        const github = new GitHubApi();
        github.authenticate({
          type: 'token',
          token: githubToken
        });
        const params = {
          org: process.env.GITHUB_ORGANIZATION,
          name: 'web',
          config: {
            url: process.env.WEBHOOK_HANDLER_URL,
            secret: process.env.GITHUB_WEBHOOK_SECRET,
            content_type: 'json'
          },
          events: [ 'delete', 'create', 'push', 'repository' ]
        };
        log.info('Creating webhook with params', params);
        github.orgs.createHook(params, (err, res) => {
          if (err) {
            log.error('Error creating webhook', err);
            reject(err);
          } else {
            log.info('Successfully created webhook', res)
            resolve(res);
          }
        });
      });
    }

    shouldUpdate() {
      return this.requestType === 'Update';
    }

    update() {
      log.info('Updating webhook');
      let config = new Config();
      return Promise.all([config.get(), parameters.getGitHubAccessToken()])
        .then(res => {
          const configuration = res[0], githubToken = res[1];
          return this.doUpdate(configuration, githubToken);
        }).then(res => this.reportStatus())
        // Don't put the entire stack in a bad state due to a failed delete or update elsewhere
        .catch(err => this.reportStatus());
    }

    doUpdate(config, githubToken) {
      return new Promise( (resolve, reject) => {
        const github = new GitHubApi();
        github.authenticate({
          type: 'token',
          token: githubToken
        });
        const params = {
          org: process.env.GITHUB_ORGANIZATION,
          id: config.data.id,
          config: {
            url: process.env.WEBHOOK_HANDLER_URL,
            secret: process.env.GITHUB_WEBHOOK_SECRET,
            content_type: 'json'
          }
        };
        log.info('Updating webhook with params', params);
        github.orgs.editHook(params, (err, res) => {
          if (err) {
            log.error('Error updating webhook', err);
            reject(err);
          } else {
            log.info('Successfully updated webhook', res);
            resolve(res);
          }
        });
      });
    }

    reportStatus(err) {
      return Promise.resolve({
        message: err ? 'FAILED' : 'SUCCESS',
        err: err
      });
    }
};

module.exports = Webhook;
