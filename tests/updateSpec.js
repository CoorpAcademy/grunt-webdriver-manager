'use strict';

var assert = require('assert');
var grunt = require('grunt');
var _ = require('lodash');
var utils = require('../tasks/lib/utils');
var WebdriverManager = require('../tasks/lib/webdriver-manager');
var testOptions = {
    silent: true
};

var webdriverManager;

describe('webdriverManager should', function() {
    beforeEach(function() {
        webdriverManager  = new WebdriverManager(testOptions, grunt);
        delete webdriverManager.options.standalone;
        delete webdriverManager.options.chrome;
        delete webdriverManager.options.ie;
        webdriverManager.clean();
    });

    after(function() {
        webdriverManager.clean();
    });

    describe('find', function() {
        this.timeout(10000000);
        it('chrome driver up to date', function(done) {
            webdriverManager.update('chrome').then(function(result) {
                assert.equal(result.length, 1, 'must only one to up date');
                assert.equal(typeof result[0], 'string', 'must get download url');
                done();
            }).catch(function(err) {
                done(err);
            });
        });
        it('ie driver up to date', function(done) {
            webdriverManager.update('ie').then(function(result) {
                assert.equal(result.length, 1, 'must only one to up date');
                if (utils.isWindows()) {
                    assert.equal(typeof result[0], 'string', 'must get download url');
                }
                else {
                    assert.equal(result[0], false, 'can\'t download url on mac or linux');
                }
                done();
            }).catch(function(err) {
                done(err);
            });
        });
        it('selenium standalone driver up to date', function(done) {
            webdriverManager.update('standalone').then(function(result) {
                assert.equal(result.length, 1, 'must only one to up date');
                assert.equal(typeof result[0], 'string', 'must get download url');
                done();
            }).catch(function(err) {
                done(err);
            });
        });
    });

    describe('not find', function() {
        before(function() {
            var newVersions = utils.versions({
                    selenium: '2.44.XXX',
                    chromedriver: '2.XXXXX',
                    iedriver: '2.44.XXX'
            });
            console.log('++++++++++', newVersions);
        });
        it('chrome driver if not exist', function(done) {
            webdriverManager.update('chrome').then(function(result) {
                assert.equal(result.length, 1, 'must only one to up date');
                assert.equal(result[0], false, 'must not find chrome driver up to date');
                done();
            }).catch(function(err) {
                done();
            });
        });
        it('selenium server if not exist', function(done) {
            webdriverManager.update('standalone').then(function(result) {
                assert.equal(result.length, 1, 'must only one to up date');
                assert.equal(result[0], false, 'must not find chrome driver up to date');
                done();
            }).catch(function(err) {
                done();
            });
        });
    });
});
