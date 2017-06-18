'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const log = require('../lib/log');

class PipelineTrigger {
  constructor(event) {
    log.info(`Instantiating pipeline trigger from event`, event);
    
    this.configFile = 'frigg.yml';
    this.body = JSON.parse(event.body);
    this.event = event.headers['X-GitHub-Event'];
    
    log.info('Event', this.event);
    // TODO remove when finished testing
    this.showIfEventHandled();
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
    if (this.isUpsertAction()) {
      log.info('Create or update action, upserting pipeline');
      return process.env.UPSERT_PIPELINE_TOPIC;
    } else if (this.isRemoveBranchAction()) {
      log.info('Remove or delete action, removing pipeline');
      return process.env.REMOVE_PIPELINE_TOPIC;
    } else if (this.isRemoveRepositoryAction()) {
      log.info('Remove repository action, removing all pipelines')
      return process.env.REMOVE_REPOSITORY_PIPELINES_TOPIC;
    } else {
      throw new Error('No matching topic from action', action);
    }
  }

  isUpsertAction() {
    return this.isCreateRepo() || this.isCreateBranch() ||
          ( this.isPushToBranch() && ( this.isFriggConfigAdded() || this.isFriggConfigModified()) );
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
    return this.isEvent('CREATE') || this.body && this.body.created;
  }

  isPushToBranch() {
    return this.isEvent('PUSH');
  }

  isDeleteBranch() {
    return this.isEvent('DELETE') || this.body && this.body.deleted;
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

  isEvent(event) {
    return this.event && event && this.event.toUpperCase() === event.toUpperCase();
  }

  isFileAdded(file) {
    return this.body && this.body.head_commit && this.body.head_commit.added && this.body.head_commit.added.includes(file)
  }

  isFileModified(file) {
    return this.body && this.body.head_commit && this.body.head_commit.modified && this.body.head_commit.modified.includes(file)
  }

  isFileRemoved(file) {
    return this.body && this.body.head_commit && this.body.head_commit.removed && this.body.head_commit.removed.includes(file)
  }

  // TODO remove when finished testing
  showIfEventHandled() {
    if (this.isUpsertAction()) {
        log.info('Upsert action');
    }
    if (this.isRemoveAction()) {
        log.info('Remove action');
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

  // TODO remove and incorporate into above

  shouldUpsertPipeline() {
    return this.shouldCreatePipeline() || this.shouldUpdatePipeline();
  }

  shouldCreatePipeline() {
    const shouldCreate = (this.event === 'repository' && this.action === 'created')
          || this.event === 'create'
          //|| this.pipelineFileAdded();
    log.info('should create: ', shouldCreate);
    return shouldCreate;
  }

  shouldUpdatePipeline() {
    const shouldUpdate = this.event === 'push' && this.pipelineFileModified();
    log.info('should update', shouldUpdate);
    return shouldUpdate;
  }

  shouldRemovePipeline() {
    const shouldRemove = (this.event === 'repository' && this.action === 'deleted')
          || this.event === 'delete'
          || this.body.deleted
          //|| this.pipelineFileRemoved();
    log.info('should remove', shouldRemove);
    return shouldRemove;
  }

  pipelineFileAdded() {
    return true;
  }

  pipelineFileModified() {
    // this.body.commits.find( commit => commit.)
    return true;
  }

  pipelineFileRemoved() {
    return true;
  }
  
  sendCreateEvent() {
  };

};

module.exports = PipelineTrigger;
