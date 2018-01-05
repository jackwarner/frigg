'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const log = require('../../utils/log');

const CONFIG_FILE = 'frigg.yml'

class PipelineEvent {
  constructor(event) {
    log.info(`Creating new pipeline event from github event`, event);
    
    this.configFile = CONFIG_FILE;
    this.body = event.body;
    this.githubEvent = event.headers['X-GitHub-Event'];
    
    log.info('GitHub event', this.githubEvent);
    // TODO remove when finished testing
    this.showIfEventHandled();
  }

  handle() {
    if (this.isRelevant()) {
      return this.send();
    } else {
      return Promise.resolve('Not a relevant pipeline event');
    }
  }

  isRelevant() {
    return this.getTopic();
  }

  send() {
    const params = {
      Message: this.getMessage(),
      TopicArn: this.getTopic()
    };
    log.info('Sending pipeline event with params', params);
    return sns.publish(params).promise();
  }

  getMessage() {
    return JSON.stringify({
      name: this.body.repository.name,
      qualifiedName: this.body.repository.full_name,
      owner: this.body.repository.owner.login,
      created: this.body.repository.created_at,
      updated: this.body.repository.updated_at,
      branch: this.getBranch()
    });
  }

  getBranch() {
    return this.body.ref ? this.body.ref.substr(this.body.ref.lastIndexOf('/') + 1) : 'master';
  }

  getTopic() {
    log.info('Getting the pipeline notification topic');
    if (this.isUpsertAction()) {
      log.info('Create or update action, upserting pipeline');
      return process.env.UPSERT_PIPELINE_TOPIC;
    } else if (this.isRemoveBranchAction()) {
      log.info('Remove or delete branch action, removing pipeline');
      return process.env.REMOVE_PIPELINE_TOPIC;
    } else if (this.isRemoveRepositoryAction()) {
      log.info('Remove repository action, removing all pipelines')
      return process.env.REMOVE_REPOSITORY_PIPELINES_TOPIC;
    } else {
      log.info('No matching topic, ignoring because not a relevant event');
    }
  }

  isUpsertAction() {
    return ( this.isCreateRepo() || this.isCreateBranch() )
        || this.isPushToBranch() && ( this.isFriggConfigAdded() || this.isFriggConfigModified());
  }

  isRemoveBranchAction() {
    return this.isDeleteBranch() || this.isFriggConfigRemoved();
  }

  isRemoveRepositoryAction() {
    return this.isDeleteRepo();
  }

  isCreateRepo() {
    return this.isAction('CREATED');
  }

  isDeleteRepo() {
    return this.isAction('DELETED');
  }

  isCreateBranch() {
    return this.isGithubEvent('CREATE') || this.body && this.body.created;
  }

  isPushToBranch() {
    return this.isGithubEvent('PUSH');
  }

  isDeleteBranch() {
    return this.isGithubEvent('DELETE') || this.body && this.body.deleted;
  }

  isFriggConfigAdded() {
    return this.isFileAdded(this.configFile);
  }

  isFriggConfigModified() {
    return this.isFileModified(this.configFile);
  }

  isFriggConfigRemoved() {
    return this.isFileRemoved(this.configFile);
  }

  isAction(action) {
    return this.body && this.body.action && action && this.body.action.toUpperCase() === action.toUpperCase();
  }

  isGithubEvent(githubEvent) {
    return this.githubEvent && githubEvent && this.githubEvent.toUpperCase() === githubEvent.toUpperCase();
  }

  isFileAdded(file) {
    log.info('Seeing if file was added', file);
    const added = this.body && this.body.head_commit && this.body.head_commit.added && this.body.head_commit.added.includes(file);
    log.info(`File ${ added ? 'was' : 'wasn\'t' } added`);
    return added;
  }

  isFileModified(file) {
    log.info('Seeing if file was modified', file);
    const modified = this.body && this.body.head_commit && this.body.head_commit.modified && this.body.head_commit.modified.includes(file);
    log.info(`File ${ modified ? 'was' : 'wasn\'t' } modified`);
    return modified;
  }

  isFileRemoved(file) {
    log.info('Seeing if file was removed', file);
    const removed = this.body && this.body.head_commit && this.body.head_commit.removed && this.body.head_commit.removed.includes(file)
    log.info(`File ${ removed ? 'was' : 'wasn\'t' } removed`);
    return removed;
  }

  // TODO remove when finished testing
  showIfEventHandled() {
    if (this.isUpsertAction()) {
      log.info('Upsert action');
    }
    if (this.isRemoveBranchAction()) {
      log.info('Remove branch action');
    }
    if (this.isRemoveRepositoryAction()) {
      log.info('Remove repository action');
    }
    if (this.isCreateRepo()) {
      log.info('A new repository was created');
    }
    if (this.isDeleteRepo()) {
      log.info('A repository was deleted');
    }
    if (this.isCreateBranch()) {
      log.info('A new branch was created');
    }
    if (this.isPushToBranch()) {
      log.info('A branch was pushed to')
    }
    if (this.isDeleteBranch()) {
      log.info('A branch was deleted');
    }
    if (this.isFriggConfigAdded()) {
      log.info('Frigg config was added');
    }
    if (this.isFriggConfigModified()) {
      log.info('Frigg config was modified');
    }
    if (this.isFriggConfigRemoved()) {
      log.info('Frigg config was removed');
    }

    if (!this.isCreateRepo() &&
        !this.isDeleteRepo() &&
        !this.isCreateBranch() &&
        !this.isPushToBranch() &&
        !this.isDeleteBranch() &&
        !this.isFriggConfigAdded() &&
        !this.isFriggConfigModified() &&
        !this.isFriggConfigRemoved()) {
      log.info('This event wasn\'t handled');
    }
  }

};

module.exports = PipelineEvent;
