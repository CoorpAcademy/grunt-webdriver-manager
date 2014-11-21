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
        }
    });

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.task.loadTasks('./tasks/');

    // Default task(s).
    grunt.registerTask('test', ['mochaTest']);
};
