'use strict';
const fs = require('fs');
const AdmZip = require('adm-zip');
const log = require('./log');

class Zip {

  constructor(directory) {
    log.info('Setting up zip archive for source directory', directory);
    let zip = new AdmZip();
    const files = fs.readdirSync(directory);
    files.forEach(file => {
      log.info('Adding file to zip archive', `${directory}/${file}`);
      zip.addLocalFile(`${directory}/${file}`);
    });
    this.zip = zip;
  }

  toBuffer() {
    return this.zip.toBuffer();
  }

};

module.exports = Zip;
