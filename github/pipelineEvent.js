'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

class PipelineEvent {
  constructor(event, action, body) {
    log.trace(`Creating pipeline event with params event=${event}, action=${action}, body=${body}`);
    this.event = event;
    this.action = action;
    this.body = body;
  }

  send() {
    const body = this.body;
    const params = {
      Message: JSON.stringify({
        name: body.repository.name,
        qualifiedName: body.repository.full_name,
        owner: body.repository.owner.login,
        created: body.repository.created_at,
        updated: body.repository.updated_at,
        branch: this.getBranch()
      }),
      TopicArn: this.getTopic()
    };
    log.trace('Sending pipeline event with params', params);
    return sns.publish(params).promise();
  }

  // TODO there is no branch for a deleted repository message
  // TODO there is also no branch for a new repository message
  getBranch() {
    return this.body.ref ? this.body.ref.substr(this.body.ref.lastIndexOf('/') + 1) : 'master';
  }

  getTopic() {
    if (this.shouldUpsertPipeline()) {
      return process.env.UPSERT_PIPELINE_TOPIC;
    } else if (this.shouldRemovePipeline()) {
      return process.env.REMOVE_PIPELINE_TOPIC;
    } else {
      return 'MY_BAD';
    }
  }

  shouldUpsertPipeline() {
    return this.shouldCreatePipeline() || this.shouldUpdatePipeline();
  }

  shouldCreatePipeline() {
    const shouldCreate = (this.event === 'repository' && this.action === 'created')
          || this.event === 'create'
          //|| this.pipelineFileAdded();
    log.trace('should create: ', shouldCreate);
    return shouldCreate;
  }

  shouldUpdatePipeline() {
    const shouldUpdate = this.event === 'push' && this.pipelineFileModified();
    log.trace('should update', shouldUpdate);
    return shouldUpdate;
  }

  shouldRemovePipeline() {
    const shouldRemove = (this.event === 'repository' && this.action === 'deleted')
          || this.event === 'delete'
          || this.body.deleted
          //|| this.pipelineFileRemoved();
    log.trace('should remove', shouldRemove);
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

module.exports = PipelineEvent;
