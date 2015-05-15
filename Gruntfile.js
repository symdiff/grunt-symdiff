/*
 * grunt-symdiff
 * https://github.com/symdiff/grunt-symdiff
 *
 * Copyright (c) 2015 Nikolaus Piccolotto
 * Licensed under the Apache, 2.0 licenses.
 */

'use strict';

var symdiffCSS = require('symdiff-css'),
    symdiffHTML = require('symdiff-html');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        symdiff: {
            foo: {
                src: 'test/fixtures/bad.*'
            },
            options: {
                css: [symdiffCSS],
                templates: [symdiffHTML]
            }
        },

        jscs: {
            src: ['*.js', 'tasks/*.js', 'test/*.js'],
            options: {
                config: '.jscsrc'
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jscs');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'symdiff']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'jscs']);

};
