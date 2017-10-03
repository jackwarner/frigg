'use strict';
const fs = require('fs');
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const cf = new AWS.CloudFormation({ apiVersion: '2010-05-15' });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const codebuild = new AWS.CodeBuild({ apiVersion: '2016-10-06' });
const Zip = require('../lib/zip');
const log = require('../lib/log');

class Pipeline {

  constructor(config) {
    log.info('Creating pipeline from config', config);
    this.config = config;
    this.templateDirectory = `pipelines/templates/${config.pipeline.name}/v${config.pipeline.version}`;
  }

  deploy() {
    log.info('Deploying pipeline');
    return createBuildArtifact()
      .then(uploadBuildArtifact)
      .then(triggerBuild);
  }

  createBuildArtifact() {
    log.info('Creating build artifact');
    let zip = new Zip(this.templateDirectory);
    return Promise.resolve(zip);
  }

  uploadBuildArtifact(zip) {
    const params = {
      Body: zip.toBuffer(),
      Bucket: process.env.BUILD_ARTIFACT_BUCKET,
      Key: 'build.zip'
    };
    log.info('Uploading build artifact with params', params);
    s3.putObject(params).promise();
  }

  triggerBuild(artifactData) {
    const params = {
      projectName: process.env.BUILD_PROJECT_NAME,
      sourceVersion: artifactData.VersionId
    };
    log.info('Triggering build with params', params);
    codebuild.startBuild(params).promise();
  }

  remove(stackName) {
    log.info('Removing pipeline');
    const params = {
      Message: JSON.stringify({
        stack: stackName ? stackName : this.config.pipeline.stackName
      }),
      TopicArn: process.env.ODIN_REMOVE_STACK_TOPIC
    };
    log.info('Sending remove pipeline request with params', params);
    return sns.publish(params).promise().then(res => this.emitPipelineRemoved());
  }

  removeBranch() {
    // TODO remove all relevant repos by isfrigg pipeline and is matching repo/stage
  }

  removeRepository() {
    log.info('Removing all pipelines for this repository')
    return this.getAllPipelineStacks()
      .then(pipelines => this.filterPipelinesFromRepository(pipelines.Stacks))
      .then(pipelines => this.removePipelines(pipelines));
  }

  getAllPipelineStacks() {
    const params = {};
    return cf.describeStacks(params).promise();
  }

  filterPipelinesFromRepository(pipelines) {
    log.info('Filtering pipeline stacks', pipelines);
    let repository = this.config.repository;
    return pipelines.filter( pipeline => {
      const isFriggPipeline = pipeline.Tags.some( tag => tag.Key.toUpperCase() === 'FRIGG');
      const isInRepository = pipeline.Tags.some( tag => tag.Key.toUpperCase() === 'REPO' && tag.Value.toUpperCase() === this.config.repository.fullyQualifiedName.toUpperCase());
      return isFriggPipeline && isInRepository;
    });
  }

  removePipelines(pipelines) {
    log.info('Removing pipelines', pipelines);
    return pipelines.forEach( pipeline => this.remove(pipeline.StackName) );
  }

  emitPipelineAdded() {
    log.info('Emitting pipeline added event');
    const params = {
      Message: JSON.stringify({
        repository: this.config.repository,
        pipeline: this.config.pipeline
      }),
      TopicArn: process.env.PIPELINE_ADDED
    };
    log.info('Sending pipeline added event with params', params);
    return sns.publish(params).promise();
  }

  emitPipelineRemoved() {
    log.info('Emitting pipeline removed event');
    const params = {
      Message: JSON.stringify({
        repository: this.config.repository,
        pipeline: this.config.pipeline
      }),
      TopicArn: process.env.PIPELINE_REMOVED
    };
    log.info('Sending pipeline removed event with params', params);
    return sns.publish(params).promise();
  }

};

module.exports = Pipeline;
