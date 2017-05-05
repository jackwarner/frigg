'use strict';
const AWS = require('aws-sdk');
const cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

class Stack {
  constructor(repo) {
    this.branch = repo.branch;
    this.owner = repo.owner;
    this.name = repo.name;
  }

  markForDeletion() {
    const params = {
      StackName: `${this.name}-pipeline-${this.branch}-local`,
      Tags: [{
        Key: 'DELETE',
        Value: 'ODIN'
      }]
    };
    log.trace('Updating stack with params', params);
    return cloudFormation.updateStack(params).promise();
  }

};

module.exports = Stack;
