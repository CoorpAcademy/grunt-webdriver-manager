'use strict';
/*
 * This is an implementation of the Local Driver Provider.
 * It is responsible for setting up the account object, tearing
 * it down, and setting up the driver correctly.
 *
 * TODO - it would be nice to do this in the launcher phase,
 * so that we only start the local selenium once per entire launch.
 */
var webdriver = require('selenium-webdriver');
var path = require('path');
var remote = require('selenium-webdriver/remote');
var fs = require('fs');
var q = require('q');
var utils = require('./utils');

var LocalDriverProvider = function(config, grunt) {
  this.config_ = config;
  this.server_ = null;
  this.grunt = grunt || require('grunt');
};

/**
 * Helper to locate the default jar path if none is provided by the user.
 * @private
 */
LocalDriverProvider.prototype.addDefaultBinaryLocs_ = function() {
  if (!this.config_.seleniumServerJar) {
    this.config_.seleniumServerJar = path.resolve(path.join(this.config_.out_dir, '/selenium-server-standalone-' +
        utils.versions().selenium + '.jar'));
  }
  if (this.config_.capabilities.browserName === 'chrome' || this.config_.capabilities.browserName === 'firefox') {
    this.config_.chromeDriver = this.config_.chromeDriver ||
        path.resolve(path.join(this.config_.out_dir, '/chromedriver'));

    // Check if file exists, if not try .exe or fail accordingly
    if (!fs.existsSync(this.config_.chromeDriver)) {
      this.config_.chromeDriver += '.exe';
      // Throw error if the client specified conf chromedriver and its not found
      if (!fs.existsSync(this.config_.chromeDriver)) {
        throw new Error('Could not find chromedriver at ' +
          this.config_.chromeDriver);
      }
    }
  }
};

/**
 * Configure and launch (if applicable) the object's environment.
 * @public
 * @return {q.promise} A promise which will resolve when the environment is
 *     ready to test.
 */
LocalDriverProvider.prototype.start = function() {
  var deferred = q.defer();
  this.addDefaultBinaryLocs_();
  if (!fs.existsSync(this.config_.seleniumServerJar)) {
    throw new Error('there\'s no selenium server jar at the specified ' +
      'location. Do you have the correct version?');
  }

  this.grunt.log.writeln('Starting selenium standalone server...');

  // configure server
  if (this.config_.chromeDriver) {
    this.config_.seleniumArgs.push('-Dwebdriver.chrome.driver=' +
      this.config_.chromeDriver);
  }
  this.server_ = new remote.SeleniumServer(this.config_.seleniumServerJar, {
      args: this.config_.seleniumArgs,
      port: this.config_.seleniumPort
    });

  // start local server, grab hosted address, and resolve promise
  this.server_.start().then(function(url) {
    this.grunt.log.writeln('Selenium standalone server started at ' + url);
    this.server_.address().then(function(address) {
      this.config_.seleniumAddress = address;
      deferred.resolve();
    }.bind(this));
  }.bind(this));

  return deferred.promise;
};

/**
 * Teardown and destroy the environment and do any associated cleanup.
 * Shuts down the driver.
 *
 * @public
 * @return {q.promise} A promise which will resolve when the environment
 *     is down.
 */
LocalDriverProvider.prototype.stop = function() {
  var deferred = q.defer();
  var self = this;

  this.grunt.log.writeln('Shutting down selenium standalone server.');
  self.server_.stop().then(function() {
      deferred.resolve();
  });

  return deferred.promise;
};

// new instance w/ each include
module.exports = LocalDriverProvider;
