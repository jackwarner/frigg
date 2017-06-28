'use strict';
const AWS = require('aws-sdk');
const docs = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const log = require('../lib/log');

class Build {

  constructor(build) {
    this.repository = build.repository;
    this.pipeline = build.pipeline;
    this.status = build.status;
  }

  saveStartedStatus() {
    const params = {
      TableName: process.env.BUILDS_TABLE,
      Item: this.getStartedItem()
    };
    console.log('Creating build with params', params);
    return new Promise( (resolve, reject) => {
      docs.put(params, (err, data) => err ? reject(err) : resolve())
    });
  }

  saveFinishedStatus() {
    const params = {
      TableName: process.env.BUILDS_TABLE,
      Item: this.getFinishedItem()
    };
    console.log('Creating build with params', params);
    return new Promise( (resolve, reject) => {
      docs.put(params, (err, data) => err ? reject(err) : resolve())
    });
  }

  removeAll() {
    return Promise.resolve();
    // TODO get all build items, then bulk delete them
    // https://stackoverflow.com/questions/38465146/how-do-i-batch-delete-with-dynamodb
  }

  getStartedItem() {
    let build = { };
    return Object.assign(this.getKey(), build);
  }

  getFinishedItem() {
    let build = {
      status: this.status
    };
    return Object.assign(this.getKey(), build);
  }

  getKey() {
    return {
      'owner/repository/branch': `${this.repository.owner}/${this.repository.name}/${this.repository.branch}`,
      timestamp: '' // TODO how to get a timestamp for this key?  needs to be available on both build start and build finish status for object create and object update
    }
  }

}

module.exports = Build;