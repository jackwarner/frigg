'use strict';
const AWS = require('aws-sdk');
const docs = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const log = require('../lib/log');

class Build {

  constructor(build) {
    this.repository = build.repository;
    this.pipeline = build.pipeline;
    this.build = build.build;
  }

  savePipeline() {
    const params = {
      TableName: process.env.PIPELINES_TABLE,
      Item: this.getPipelineItem()
    };
    console.log('Creating pipeline with params', params);
    return new Promise( (resolve, reject) => {
      docs.put(params, (err, data) => err ? reject(err) : resolve())
    });
  }

  removePipeline() {
    const params = {
      TableName: process.env.PIPELINES_TABLE,
      Key: this.getPipelineKey()
    };
    console.log('Removing pipeline with params', params);
    return new Promise( (resolve, reject) => {
      docs.delete(params, (err, data) => err ? reject(err) : resolve())
    });
  }

  removeBuilds() {
    // TODO get all build items, then bulk delete them
    // https://stackoverflow.com/questions/38465146/how-do-i-batch-delete-with-dynamodb
  }

  getPipelineItem() {
    let pipeline = {
      templateName: this.pipeline.name,
      templateVersion: this.pipeline.version,
      lastBuildDate: '',
      lastBuildStatus: ''
    };
    return Object.assign(this.getPipelineKey(), pipeline);
  }

  getPipelineKey() {
    return {
      'owner/repository': `${this.repository.owner}/${this.repository.name}`,
      branch: this.repository.branch
    };
  }

  getBuildKey() {
    return {
      'owner/repository/branch': `${this.repository.owner}/${this.repository.name}/${this.repository.branch}`,
      timestamp: ''
    }
  }

}

module.exports = Build;