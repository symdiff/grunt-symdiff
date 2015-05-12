# grunt-symdiff

[![Build Status](https://travis-ci.org/symdiff/grunt-symdiff.svg)](https://travis-ci.org/symdiff/grunt-symdiff) 
[![Coverage Status](https://coveralls.io/repos/symdiff/grunt-symdiff/badge.svg)](https://coveralls.io/r/symdiff/grunt-symdiff)

Grunt plugin for symdiff.

## Installation

    npm install grunt-symdiff

## Usage

    var symdiffCSS = require('symdiff-css'),
        symdiffHTML = require('symdiff-html');

    grunt.initConfig({
        symdiff: {
            foo: {
                src: 'test/fixtures/bad.*'
            },
            options: {
                css: [symdiffCSS],
                templates: [symdiffHTML],
                ignore: [/regex/, 'string']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');