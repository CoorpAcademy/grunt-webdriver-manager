'use strict';

var path = require('path');
var os = require('os');
var _ = require('lodash');
var webdriverVersions = require(path.join(__dirname, '/../../package.json')).webdriverVersions;

module.exports.versions =  function(overrideOptions) {
    if (overrideOptions) {
        webdriverVersions = _.defaults(overrideOptions, webdriverVersions);
    }
    return _.clone(webdriverVersions);
};

module.exports.isWindows = function() {
    return os.type().toLowerCase().indexOf('windows') >= 0 ;
};

module.exports.isMac = function() {
    return os.type().toLowerCase().indexOf('darwin') >= 0 ;
};

module.exports.isLinux = function() {
    return os.type().toLowerCase().indexOf('linux') >= 0 ;
};

module.exports.isX64 = function() {
    return os.arch() === 'x64';
};
