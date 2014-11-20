'use strict';

var WebdriverManager = require('./lib/webdriver-manager');

module.exports = function(grunt) {
    grunt.registerTask('webdrivermanager', 'Handle selenium webdriver task', function(command, arg1) {
        var options = grunt.config('webdrivermanager') || {};
        var webdriverManager = new WebdriverManager(options, grunt);
        var done;
        switch (command) {
            case 'update':
                done = this.async();
                webdriverManager.update(arg1).then(done).catch(done);
            break;
            case 'start':
                done = this.async();
                webdriverManager.start().then(done).catch(done);
            break;
            case 'stop':
                done = this.async();
                webdriverManager.stop().then(done).catch(done);
            break;
            case 'status':
                webdriverManager.status();
            break;
            case 'clean':
                webdriverManager.clean();
            break;
            default:
                grunt.log.writeln('Available command are : update, status, start, stop, clean');
            break;
        }
    });
};
