'use strict';
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const log = require('../../utils/log');

const CONFIG_KEY = 'github-webhook-config.json';

class Config {
  
  save(config) {
    const params = {
      Body: JSON.stringify(this.config),
      Bucket: process.env.FRIGG_CONFIG_BUCKET,
      Key: CONFIG_KEY
    };
    log.info('Saving webhook config with params', params);
    return s3.putObject(params).promise();
  }

  get() {
    const params = {
      Bucket: process.env.FRIGG_CONFIG_BUCKET,
      Key: CONFIG_KEY
    };
    log.info('Getting webhook config with params', params);
    return s3.getObject(params).promise(res => JSON.parse(res.Body.toString('utf-8')));
  }

  emptyBucket() {
    return this.listBucketObjects().then(res => this.deleteObjects(res.Contents));
  }

  listBucketObjects() {
    const params = { Bucket: process.env.FRIGG_CONFIG_BUCKET };
    log.debug('Listing objects with params', params);
    return s3.listObjectsV2(params).promise();
  }

  deleteObjects(objects) {
    const params = {
      Bucket: process.env.FRIGG_CONFIG_BUCKET,
      Delete: {
        Objects: objects.map( object => { return { Key: object.Key } })
      }
    };
    log.debug('Deleting objects with params', params);
    return s3.deleteObjects(params).promise();
  }
};

module.exports = Config;
