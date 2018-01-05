'use strict';
const fs = require('fs');
// TODO replace with archiver
const AdmZip = require('adm-zip');
const zip = require('zip-dir');
const log = require('./log');

class Zip {

  constructor(directory) {
    log.info('Setting up zip archive for source directory', directory);
    return new Promise( (resolve, reject) => {
      zip(directory, (err, buffer) => {
        if (err) {
          log.info('Error creating zip archive of directory', err);
          reject(err);
        } else {
          log.info('Successfully created zip archive of directory');
          resolve(buffer);
        }
      });
    });
    // let zip = new AdmZip();
    // const files = fs.readdirSync(directory);
    // files.forEach(file => {
    //   log.info('Adding file to zip archive', `${directory}/${file}`);
    //   zip.addLocalFile(`${directory}/${file}`);
    // });
    // this.zip = zip;
  }

  // toBuffer() {
  //   return this.zip.toBuffer();
  // }

};

module.exports = Zip;
