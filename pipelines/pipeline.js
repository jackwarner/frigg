'use strict';
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
const cf = new AWS.CloudFormation({ apiVersion: '2010-05-15' });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const codebuild = new AWS.CodeBuild({ apiVersion: '2016-10-06' });
const fs = require('fs-extra');
const yaml = require('js-yaml');
const Zip = require('../lib/zip');
const log = require('../lib/log');
const parameters = require('../lib/parameters');

class Pipeline {

  constructor(config) {
    log.info('Creating pipeline from config', config);
    this.config = config;
    this.templateDirectory = `pipelines/templates/${config.pipeline.name}/v${config.pipeline.version}`;
    this.workingDirectory = '/tmp/pipeline';
  }

  deploy() {
    log.info('Deploying pipeline');
    return this.copyBuildArtifactTemplate()
      .then(res => parameters.getGitHubAccessToken())
      .then(token => this.updateBuildArtifactProperties(token))
      .then(res => this.createBuildArtifact())
      .then(artifact => this.uploadBuildArtifact(artifact))
      .then(artifactMetaData => this.triggerBuild(artifactMetaData));
  }

  copyBuildArtifactTemplate() {
    log.info(`Clearing existing pipeline templates from ${this.workingDirectory}`);
    fs.removeSync(this.workingDirectory);
    log.info(`Copying pipeline templates from ${this.templateDirectory} to ${this.workingDirectory}`);
    fs.copySync(this.templateDirectory, this.workingDirectory);
    return Promise.resolve();
  }

  updateBuildArtifactProperties(githubToken) {
    let buildspec = yaml.safeLoad(fs.readFileSync(`${this.workingDirectory}/buildspec.yml`, 'utf8'));
    log.info('Parsed buildspec', buildspec);
    const repo = this.config.repository;
    const pipeline = this.config.pipeline;
    buildspec.env.variables = {
      STAGE: pipeline.stage,
      PIPELINE_SERVICE_NAME: pipeline.serviceName,
      OWNER: repo.owner,
      REPO: repo.name,
      BRANCH: repo.branch,
      BUILD_STATUS_TOPIC: process.env.PIPELINE_ADDED_TOPIC,
      GITHUB_TOKEN: githubToken
    };
    log.info('Writing new buildspec', buildspec);
    fs.writeFileSync(`${this.workingDirectory}/buildspec.yml`, yaml.safeDump(buildspec), 'utf-8');
    return Promise.resolve();
  }

  createBuildArtifact() {
    log.info('Creating build artifact');
    let zip = new Zip(this.workingDirectory);
    return Promise.resolve(zip);
  }

  uploadBuildArtifact(zip) {
    const params = {
      Body: zip.toBuffer(),
      Bucket: process.env.BUILD_ARTIFACT_BUCKET,
      Key: 'build.zip'
    };
    log.info('Uploading build artifact with params', params);
    return s3.putObject(params).promise();
  }

  triggerBuild(artifactMetaData) {
    log.info('Received artifact meta data', artifactMetaData);
    const params = {
      projectName: process.env.BUILD_PROJECT_NAME,
      sourceVersion: artifactMetaData.VersionId
    };
    log.info('Triggering build with params', params);
    return codebuild.startBuild(params).promise();
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
      TopicArn: process.env.PIPELINE_ADDED_TOPIC
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
      TopicArn: process.env.PIPELINE_REMOVED_TOPIC
    };
    log.info('Sending pipeline removed event with params', params);
    return sns.publish(params).promise();
  }

};

module.exports = Pipeline;
