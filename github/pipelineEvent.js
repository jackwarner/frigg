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
    if (this.shouldCreatePipeline()) {
      return this.sendCreateEvent();
    } else if (this.shouldUpdatePipeline()) {
      return this.sendUpdateEvent();
    } else if (this.shouldRemovePipeline()) {
      return this.sendRemoveEvent();
    } 
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

        }
      }),
      TopicArn: process.env.CREATE_PIPELINE_TOPIC
    };
    log.trace('Sending create pipeline event with params', params);
    return sns.publish(params).promise();
  };

  sendUpdateEvent() {
    const params = {
      Message: JSON.stringify({
        test: "test"
      }),
      TopicArn: process.env.UPDATE_PIPELINE_TOPIC
    };
    log.trace('Sending update pipeline event with params', params);
    return sns.publish(params).promise();
  };

  sendRemoveEvent() {
    const params = {
      Message: JSON.stringify({
        test: "test"
      }),
      TopicArn: process.env.REMOVE_PIPELINE_TOPIC
    };
    log.trace('Sending remove pipeline event with params', params);
    return sns.publish(params).promise();
  };

};

module.exports = PipelineEvent;
