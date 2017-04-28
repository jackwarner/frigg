'use strict';
const fs = require('fs');
const path = require('path');
const tar = require('tar-fs');
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

class Git {
  constructor() {
    this.directory = '/tmp/git';
    this.version = 'git-2.4.3.tar';
  }

  install() {
    log.trace('Installing Git');
    return Promise.all([this.extractGit(), this.updatePaths()]);
  }

  extractGit() {
    log.trace('Extracting Git');
    return new Promise( (resolve, reject) => {
      let stream = fs.createReadStream(path.join(__dirname, this.version))
        .pipe(tar.extract(this.directory));
      stream.on('finish', () => {
        resolve();
      });
    });
  }

  updatePaths() {
    log.trace('Updating path with Git environment variables');
    const binPath = path.join(this.directory, 'usr/bin');
    const GIT_TEMPLATE_DIR = path.join(this.directory, 'usr/share/git-core/templates');
    const GIT_EXEC_PATH = path.join(this.directory, 'usr/libexec/git-core');

    process.env.PATH = process.env.PATH + ':' + binPath;
    process.env.GIT_TEMPLATE_DIR = GIT_TEMPLATE_DIR;
    process.env.GIT_EXEC_PATH = GIT_EXEC_PATH;
    return Promise.resolve();
  }
};

module.exports = Git;
