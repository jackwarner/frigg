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
        repository: {
          name: body.repository.name,
          qualifiedName: body.repository.full_name,
          owner: body.repository.owner.login,
          api: body.repository.url,
          html: body.repository.html_url,
          created: body.repository.created_at,
          updated: body.repository.updated_at
        },
        branch: {

        },
        modification: this.getModification()
      }),
      TopicArn: process.env.CREATE_PIPELINE_TOPIC
    };
    log.trace('Sending create pipeline event with params', params);
    return sns.publish(params).promise();
  }

  getModification() {
    if (this.shouldUpsertPipeline()) {
      return 'UPSERT';
    } else if (this.shouldRemovePipeline()) {
      return 'REMOVE';
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
          || this.pipelineFileAdded();
  }

  shouldUpdatePipeline() {
    return this.event === 'push' && this.pipelineFileModified();
  }

  shouldRemovePipeline() {
    return (this.event === 'repository' && this.action === 'deleted')
          || this.event === 'delete'
          || this.pipelineFileRemoved();
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
