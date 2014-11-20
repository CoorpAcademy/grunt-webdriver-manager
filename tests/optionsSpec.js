'use strict';

var assert = require('assert');
var grunt = require('grunt');
var _ = require('lodash');
var WebdriverManager = require('../tasks/lib/webdriver-manager');

var testOptions = {
    capabilities: {
        browserName: 'chromebeta'
    }
};

var webdriverManager;

describe('webdriverManager should', function() {
    describe('configure', function() {
        it('default options', function() {
            var webdriverManager = new WebdriverManager({}, grunt);
            // get new options
            var options = webdriverManager.options;
            // options must be equal and merged
            assert.equal(options.capabilities.browserName, 'chrome');
        });

        it('specific options', function() {
            // set test options
            var webdriverManager = new WebdriverManager(testOptions, grunt);
            // get new options
            var options = webdriverManager.options;

            // options must be equal and merged
            assert.equal(options.capabilities.browserName, 'chromebeta', 'browserName, should be overwritted');
            assert.equal(options.seleniumPort, 4444, 'options must have default options added');
        });
    });
});
