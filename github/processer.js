'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const log = require('winston');
log.level = process.env.LOG_LEVEL;

class Processor {
  constructor(event, action, body) {
    log.info(`Creating pipeline event with params event=${event}, action=${action}, body=${body}`);
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
    log.info('Sending pipeline event with params', params);
    return sns.publish(params).promise();
  }

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

module.exports = Processor;
