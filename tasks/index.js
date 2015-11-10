'use strict';

var WebdriverManager = require('./lib/webdriver-manager');

module.exports = function(grunt) {
    grunt.registerTask('webdrivermanager', 'Handle selenium webdriver task', function(command, arg1) {
        var options = grunt.config('webdrivermanager') || {};
        grunt.verbose.writeln(options);
        var webdriverManager = new WebdriverManager(options, grunt);
        var done = this.async();
        switch (command) {
            case 'update':
                webdriverManager.update(arg1).then(done).catch(done);
            break;
            case 'start':
                webdriverManager.start().then(done).catch(done);
            break;
            case 'stop':
                webdriverManager.stop().then(done).catch(done);
            break;
            case 'status':
                webdriverManager.status();
                done();
            break;
            case 'clean':
                webdriverManager.clean();
                done();
            break;
            default:
                grunt.log.writeln('Available command are : update, status, start, stop, clean');
                done();
            break;
        }
    });
};
