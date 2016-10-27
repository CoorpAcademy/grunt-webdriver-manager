'use strict';
var fs = require('fs');
var os = require('os');
var url = require('url');
var request = require('request');
var http = require('http');
var path = require('path');
var AdmZip = require('adm-zip');
var optimist = require('optimist');
var childProcess = require('child_process');
var utils = require('./utils');
var q = require('q');
var _ = require('lodash');

/**
 * Download the requested binaries to node_modules/protractor/selenium/
 */
var SELENIUM_DIR = path.join(__dirname, '/../../selenium');

var defaultOptions = {
  out_dir: SELENIUM_DIR,
  ignore_ssl: false,
  proxy: false
};

/**
 * Get the major and minor version but ignore the patch (required for selenium
 * download URLs).
 */
var shortVersion = function(version) {
  return version.slice(0, version.lastIndexOf('.'));
};

function isMac64(versions) {
    //x64 since 2.23
    var versionsSplited = versions.split('.');
    var major = parseInt(versionsSplited[0]);
    var minor = parseInt(versionsSplited[1]);
    if(major > 2) {
        return true;
    }
    if(major <= 1) {
        return false;
    }

    if(minor >= 23) {
        return true;
    }
    return false;

}

var getBinaries = function(options) {
  options = options  || {};
  var versions = utils.versions(options.webdriverVersions);
  return {
    standalone: {
      name: 'selenium standalone',
      isDefault: true,
      prefix: 'selenium-server-standalone',
      filename: 'selenium-server-standalone-' + versions.selenium + '.jar',
      url: function() {
        return 'https://selenium-release.storage.googleapis.com/' +
            shortVersion(versions.selenium) + '/' +
            'selenium-server-standalone-' + versions.selenium + '.jar';
      }
    },
    chrome: {
      name: 'chromedriver',
      isDefault: true,
      prefix: 'chromedriver_',
      filename: 'chromedriver_' + versions.chromedriver + '.zip',
      url: function() {
        var urlPrefix = 'https://chromedriver.storage.googleapis.com/' +
            versions.chromedriver + '/chromedriver_';
        if (utils.isMac()) {
            if (isMac64(versions.chromedriver)) {
                return urlPrefix + 'mac64.zip';
            }
            return urlPrefix + 'mac32.zip';
        }
        else if (utils.isLinux()) {
          if (utils.isX64()) {
            return urlPrefix + 'linux64.zip';
          }
          else {
            return urlPrefix + 'linux32.zip';
          }
        }
        else if (utils.isWindows()) {
          return urlPrefix + 'win32.zip';
        }
      }
    },
    ie: {
      name: 'IEDriver',
      isDefault: false,
      prefix: 'IEDriverServer',
      filename: 'IEDriverServer_' + versions.iedriver + '.zip',
      url: function() {
        var urlPrefix = 'https://selenium-release.storage.googleapis.com/' +
            shortVersion(versions.iedriver) + '/IEDriverServer';
        if (utils.isWindows() === 'Windows_NT') {
          if (utils.isX64()) {
            return urlPrefix + '_x64_' + versions.iedriver + '.zip';
          }
          else {
            return urlPrefix + '_Win32_' + versions.iedriver + '.zip';
          }
        }
      }
    }
  };
};

var ensureSeleniumDirectory = function(out_dir) {
  if (!fs.existsSync(out_dir) || !fs.statSync(out_dir).isDirectory()) {
    fs.mkdirSync(out_dir);
  }
};

var searchForFilePattern = function(existingFiles, bin) {
  return existingFiles.some(function(file) {
    return (file.indexOf(bin.prefix) !== -1 && file !== bin.filename);
  });
};

var checkBinariesExists = function(out_dir, binaries) {
  // Setup before any command.
  var existingFiles = fs.readdirSync(out_dir);
  for (var name in binaries) {
    if (!binaries.hasOwnProperty(name)) {
      continue;
    }
    var bin = binaries[name];
    bin.fullPath = path.join(out_dir, bin.filename);
    bin.exists = fs.existsSync(bin.fullPath);
    bin.outOfDateExists = searchForFilePattern(existingFiles, bin);
    }
  return existingFiles;
};

var resolveProxy = function(fileUrl, proxy) {
  var protocol = url.parse(fileUrl).protocol;
  if (proxy) {
    return proxy;
  }
  else if (protocol === 'https:') {
    return process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  }
  else if (protocol === 'http:') {
    return process.env.HTTP_PROXY || process.env.http_proxy;
  }
};

/**
 * Function to download file using HTTP.get.
 * TODO: look into using something instead of request here, to avoid the
 * big dependency cost. It's required for now to follow redirects.
 */
var httpGetFile = function(fileUrl, fileName, options, grunt, callback) {
  callback = callback || _.noop();
  var proxy = options.proxy;
  var ignoreSSL = options.ignore_ssl;
  var outputDir = options.out_dir;
  grunt.log.writeln('downloading ' + fileUrl + '...');
  var filePath = path.join(outputDir, fileName);
  var file = fs.createWriteStream(filePath);

  if (ignoreSSL) {
    grunt.log.writeln('Ignoring SSL certificate');
  }

  var requestOptions = {
    url: fileUrl,
    strictSSL: !ignoreSSL,
    proxy: resolveProxy(fileUrl, proxy),
    method: options.method
  };

  var callbacked = false;

  request(requestOptions)
      .on('response', function(response) {
        if (response.statusCode !== 200) {
          fs.unlink(filePath);
          grunt.log.errorlns('Error: Got code ' + response.statusCode + ' from ' + fileUrl);
          callbacked = true;
          callback(false);
        }
      })
      .on('error', function(error) {
        fs.unlink(filePath);
        grunt.log.errorlns('Error: Got error ' + error + ' from ' + fileUrl);
        callbacked = true;
        callback(false);
      })
      .on('data', function(data) {
        file.write(data);
      })
      .on('end', function() {
        file.end(function() {
          if (callbacked) {
            return;
          }
          grunt.log.writeln(fileName + ' downloaded to ' + filePath);
          callback(filePath);
        });
      });
};

/**
 * Normalize a command across OS
 */
var spawnCommand = function(command, args) {
  var win32 = process.platform === 'win32';
  var winCommand = win32 ? 'cmd' : command;
  var finalArgs = win32 ? ['/c'].concat(command, args) : args;

  return childProcess.spawn(winCommand, finalArgs,
      {
        stdio: 'inherit'
      });
};

/**
 * If a new version of the file with the given url exists, download and
 * delete the old version.
 */
var downloadIfNew = function(bin, options, grunt, existingFiles, opt_callback) {
  opt_callback = opt_callback || _.noop();
  if (!bin.exists) {
    // Remove anything else that matches the exclusive prefix.
    existingFiles.forEach(function(file) {
      if (file.indexOf(bin.prefix) !== -1) {
        fs.unlinkSync(path.join(options.out_dir, file));
      }
    });
    grunt.log.writeln('Updating ' + bin.name);
    var url = bin.url();
    if (!url) {
      grunt.log.errorlns(bin.name + ' is not available for your system.');
      return opt_callback(false);
    }
    httpGetFile(url, bin.filename, options, grunt, opt_callback);
  }
  else {
    grunt.log.writeln(bin.name + ' is up to date.');
    opt_callback(true);
  }
};

/**
 * Append '.exe' to a filename if the system is windows.
 */
var executableName = function(file) {
  if (os.type() === 'Windows_NT') {
    return file + '.exe';
  }
  else {
    return file;
  }
};

var WebDriverCli = function(options, grunt) {
  this.grunt = grunt || require('grunt');
  this.setOptions(options);
};

WebDriverCli.prototype.setOptions = function(options) {
  this.options = _.defaults(options, defaultOptions);
  this.grunt.verbose.writeln('webdriver-cli options', this.options);
  this.init();
};

WebDriverCli.prototype.init = function() {
  this.binaries = getBinaries(this.options);
  ensureSeleniumDirectory(this.options.out_dir);
  this.existingFiles = checkBinariesExists(this.options.out_dir, this.binaries);
};

WebDriverCli.prototype.status = function() {
  var binaries = this.binaries;
  for (var name in binaries) {
    if (!binaries.hasOwnProperty(name)) {
      continue;
    }
    var bin = binaries[name];
    if (bin.exists) {
      this.grunt.log.writeln(bin.name + ' is up to date');
    }
    else if (bin.outOfDateExists) {
      this.grunt.log.writeln(bin.name + ' needs to be updated');
    }
    else {
      this.grunt.log.writeln(bin.name + ' is not present');
    }
  }
};

WebDriverCli.prototype.update = function() {
  var binaries = this.binaries;
  var deferreds = [];
  if (this.options.standalone) {
    var deferredS = q.defer();
    deferreds.push(deferredS.promise);
    downloadIfNew(binaries.standalone, this.options, this.grunt, this.existingFiles,
      function(fileName) {
        if (fileName === false) {
          return deferredS.reject();
        }
        deferredS.resolve(fileName);
      });
  }
  if (this.options.chrome) {
    var deferredC = q.defer();
    deferreds.push(deferredC.promise);
    downloadIfNew(binaries.chrome, this.options, this.grunt, this.existingFiles,
      function(fileName) {
        if (fileName === false) {
          deferredC.reject();
        }
        if (typeof fileName === 'string') {
          var zip = new AdmZip(fileName);
          // Expected contents of the zip:
          //   mac/linux: chromedriver
          //   windows: chromedriver.exe
          zip.extractAllTo(this.options.out_dir);
          if (os.type() !== 'Windows_NT') {
            fs.chmodSync(path.join(this.options.out_dir, 'chromedriver'), parseInt('0755', 8));
          }
        }
        deferredC.resolve(fileName);
      }.bind(this));
  }
  if (this.options.ie) {
    var deferredI = q.defer();
    deferreds.push(deferredI.promise);
    downloadIfNew(binaries.ie, this.options, this.grunt, this.existingFiles,
      function(fileName) {
        if (fileName === false) {
          return deferredI.reject();
        }if (typeof fileName === 'string') {
          var zip = new AdmZip(fileName);
          // Expected contents of the zip:
          //   IEDriverServer.exe
          zip.extractAllTo(this.options.out_dir);
        }
        deferredI.resolve(fileName);
      }.bind(this));
  }
  return q.allSettled(deferreds).then(function(results) {
      var values = [];
      results.forEach(function(result) {
          if (result.state === 'fulfilled') {
              values.push(result.value);
          }
          else {
              values.push(false);
          }
      });
      return values;
  });
};

WebDriverCli.prototype.clean = function() {
  var existingFiles = fs.readdirSync(this.options.out_dir);
  existingFiles.forEach(function(file) {
    fs.unlinkSync(path.join(this.options.out_dir, file));
  }.bind(this));
  this.init();
};

module.exports = WebDriverCli;
