'use strict';

var WebdriverManager = require('./lib/webdriver-manager');

module.exports = function(grunt) {
    grunt.registerTask('webdrivermanager', 'Handle selenium webdriver task', function(command) {
        var webdriverManager = new WebdriverManager(this.options(), grunt);
        var done;
        switch (command) {
            case 'update':
                done = this.async();
                webdriverManager.update().then(done);
            break;
            case 'start':
                done = this.async();
                webdriverManager.start().then(done);
            break;
            case 'stop':
                done = this.async();
                webdriverManager.stop().then(done);
            break;
            default:
                grunt.log.writeln('inly supported command are update, start and stop');
            break;
        }
    });
};
