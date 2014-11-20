'use strict';
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: [
                'tests/**/*Spec.js'
                ]
            }
        },
        webdrivermanager: {
            out_dir: './selenium',
            capabilities: {
                browserName: 'chrome'
            },
            seleniumArgs: [],
            seleniumPort: 4444,
            ignore_ssl: false,
            proxy: false,
            method: 'GET'
        }
    });

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.task.loadTasks('./tasks/');

    // Default task(s).
    grunt.registerTask('test', ['mochaTest']);
};
