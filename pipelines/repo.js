'use strict';
const log = require('console-log-level')({ level: process.env.LOG_LEVEL });

class Repo {
  constructor(url) {
    this.url = url;
  }

  getRepo() {
    downloadRepo()
      .then(unzipRepo)
      .catch(err => log.error(err));
  }

  downloadRepo() {
    const url = this.url;
    return new Promise( (resolve, reject) => {
      let repo = '';
      https.get(url, res => {
        res.on('data', chunk => repo += chunk);
        res.on('end', () => resolve(repo));
      }).on('error', err => reject(err));
    });
  }

  unzipRepo(repo) {
    
  }
}