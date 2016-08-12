'use strict';

var path = require('path');
var _ = require('lodash');
var q = require('q');
var WebDriverCli = require('./webdriver-cli');
var _defaultOptions = {
    capabilities: {
        browserName: 'chrome'
    },
    seleniumArgs: [],
    seleniumPort: 4444
};

var LocalDriverProvider = require('./selenium-server');

var webDriverManagers = [];

var WebDriverManager = function(options, grunt) {
    this.grunt = grunt || require('grunt');
    this.setOptions(options);
    webDriverManagers.push(this);
};

WebDriverManager.prototype.setOptions = function(options) {
    this.options = _.defaults(_.clone(options), _defaultOptions);
    this.grunt.verbose.writeln('options are', this.options);
    this.init();
};

WebDriverManager.prototype.init = function() {
    this.localDriverProvider = null;
    this.serverStarted = false;
    this.localDriverProvider = new LocalDriverProvider(this.options);
    this.webDriverCli = new WebDriverCli(this.options);
    this.binaries = this.webDriverCli.binaries;
};

WebDriverManager.prototype._defaultOptions = function() {
    return _.clone(_defaultOptions);
};

/**
 * update the local folder downloading correct drivers
 * @return {[type]} [description]
 */
WebDriverManager.prototype.update = function(binary) {
    if (binary) {
        this.options[binary] = true;
    }
    else {
        this.options.chrome = true;
        this.options.ie = true;
        this.options.standalone = true;
    }
    return this.webDriverCli.update();
};

WebDriverManager.prototype.clean = function() {
    return this.webDriverCli.clean();
};

WebDriverManager.prototype.status = function() {
    return this.webDriverCli.status();
};

/**
 * start the selenium server
 * @return promise
 */
WebDriverManager.prototype.start = function() {
    if (this.serverStarted) {
        this.stop();
    }
    return this.localDriverProvider.start().then(function() {
        this.serverStarted = true;
    }.bind(this));
};

/**
 * immediatly stop the server
 * @return {[type]} [description]
 */
WebDriverManager.prototype.stop = function() {
    if (this.localDriverProvider && this.serverStarted) {
        var driver = this.localDriverProvider;
        this.localDriverProvider = null;
        this.serverStarted = false;
        return driver.stop();
    }

    var deferred = q.defer();
    deferred.resolve();
    return deferred.promise;
};

process.on('exit', function() {
    for (var i = 0; i < webDriverManagers.length;i++) {
        if(!webDriverManagers[i].options.daemon) {
            webDriverManagers[i].stop();
        }
    }
});

module.exports = WebDriverManager;
