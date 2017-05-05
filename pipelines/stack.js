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

  }

  getStack() {
    // return cloudFormation.
  }

  getBucketsToEmpty() {

  }

  emptyBuckets() {

  }

};

module.exports = Stack;
