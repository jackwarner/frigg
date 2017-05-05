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

  remove() {
    return this.getStack()
              // TODO be more defensive about return object
              .then(stack => this.emptyBuckets(stack.data.Stacks[0]))
              .then(stack => this.doRemove(stack))
              .then(res => callback(null, 'Successfully removed stack'))
              .then(err => callback(err));
  }

  getStack() {
    const params = {
      StackName: 'frigg-pipeline-test-local'
    };
    log.trace('Getting stack with params', params);
    return cloudFormation.describeStacks(params).promise();
  }

  emptyBuckets(stack) {
    let bucketsToEmpty = [];
    if (stack.Outputs && stack.Outputs.length > 0) {
      bucketsToEmpty = stack.Outputs
        .filter(output => ['ServerlessDeploymentBucketName'].indexOf(output.OutputKey) > -1)
        .map(output => output.OutputValue);
    }
    bucketsToEmpty.map(bucket => this.emptyBuckets(bucket));
  }

  emptyBucket(bucket) {
    
  }

  doRemove(stack) {

  }

};

module.exports = Stack;
