'use strict';
const AWS = require('aws-sdk');
const docs = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const log = require('../utils/log');

class Pipeline {

  constructor(build) {
    this.repository = build.repository;
    this.pipeline = build.pipeline;
  }

  save() {
    const params = {
      TableName: process.env.PIPELINES_TABLE,
      Item: this.getItem()
    };
    console.log('Creating pipeline with params', params);
    return new Promise( (resolve, reject) => {
      docs.put(params, (err, data) => err ? reject(err) : resolve())
    });
  }

  remove() {
    const params = {
      TableName: process.env.PIPELINES_TABLE,
      Key: this.getKey()
    };
    console.log('Removing pipeline with params', params);
    return new Promise( (resolve, reject) => {
      docs.delete(params, (err, data) => err ? reject(err) : resolve())
    });
  }

  getItem() {
    let pipeline = {
      templateName: this.pipeline.name,
      templateVersion: this.pipeline.version
    };
    return Object.assign(this.getKey(), pipeline);
  }

  getKey() {
    return {
      'owner/repository': `${this.repository.owner}/${this.repository.name}`,
      branch: this.repository.branch
    };
  }

}

module.exports = Pipeline;