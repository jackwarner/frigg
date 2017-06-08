'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

class PipelineEvent {
  constructor(event, action, body) {
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
    log.trace('Sending create pipeline event with params', params);
    return sns.publish(params).promise();
  }

  // TODO there is no branch for a deleted repository message
  getBranch() {
    return this.body.ref.substr(this.body.ref.lastIndexOf('/') + 1);
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
    return (this.event === 'repository' && this.action === 'created')
          || this.event === 'create'
          //|| this.pipelineFileAdded();
  }

  shouldUpdatePipeline() {
    return this.event === 'push' && this.pipelineFileModified();
  }

  shouldRemovePipeline() {
    return (this.event === 'repository' && this.action === 'deleted')
          || this.event === 'delete'
          //|| this.pipelineFileRemoved();
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
