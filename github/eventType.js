'use strict';
const log = require('winston');
log.level = process.env.LOG_LEVEL;

class EventType {
  constructor(payload) {
    log.info('Instantiating event from payload', payload);
    this.body = JSON.parse(payload.body);
    this.event = payload.headers['X-GitHub-Event'];
    
    log.info('Event', this.event);

    if (this.isCreateRepo()) {
      log.info('A new repository was created');
    }
    if (this.isDeleteRepo()) {
      log.info('A repository was deleted');
    }
    if (this.isCreateBranch()) {
      log.info('A new branch was created');
    }
    if (this.isPushToBranch()) {
      log.info('A branch was pushed to')
    }
    if (this.isDeleteBranch()) {
      log.info('A branch was deleted');
    }
    if (this.isFriggConfigAdded()) {
      log.info('Frigg config was added');
    }
    if (this.isFriggConfigModified()) {
      log.info('Frigg config was modified');
    }
    if (this.isFriggConfigRemoved()) {
      log.info('Frigg config was removed');
    }

    if (!this.isCreateRepo() &&
        !this.isDeleteRepo() &&
        !this.isCreateBranch() &&
        !this.isPushToBranch() &&
        !this.isDeleteBranch() &&
        !this.isFriggConfigAdded() &&
        !this.isFriggConfigModified() &&
        !this.isFriggConfigRemoved()) {
      log.info('This event wasn\'t handled');
    }
  }

  isCreateRepo() {
    return this.isAction('CREATED');
  }

  isDeleteRepo() {
    return this.isAction('DELETED');
  }

  isCreateBranch() {
    return this.isEvent('CREATE') || this.body && this.body.created;
  }

  isPushToBranch() {
    return this.isEvent('PUSH');
  }

  isDeleteBranch() {
    return this.isEvent('DELETE') || this.body && this.body.deleted;
  }

  isFriggConfigAdded() {
    return this.isFileAdded('frigg.yml');
  }

  isFriggConfigModified() {
    return this.isFileModified('frigg.yml');
  }

  isFriggConfigRemoved() {
    return this.isFileRemoved('frigg.yml');
  }

  isAction(action) {
    return this.body && this.body.action && action && this.body.action.toUpperCase() === action.toUpperCase();
  }

  isEvent(event) {
    return this.event && event && this.event.toUpperCase() === event.toUpperCase();
  }

  isFileAdded(file) {
    return this.body && this.body.head_commit && this.body.head_commit.added && this.body.head_commit.added.includes(file)
  }

  isFileModified(file) {
    return this.body && this.body.head_commit && this.body.head_commit.modified && this.body.head_commit.modified.includes(file)
  }

  isFileRemoved(file) {
    return this.body && this.body.head_commit && this.body.head_commit.removed && this.body.head_commit.removed.includes(file)
  }

  isPertinent() {
    log.trace('Checking to see if event is pertinent');
    const validEvents = ['create', 'delete', 'repository', 'push'];
    return validEvents.indexOf(this.event) > -1;
  }

};

module.exports = EventType;