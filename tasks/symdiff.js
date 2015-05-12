/*
 * grunt-symdiff
 * https://github.com/symdiff/grunt-symdiff
 *
 * Copyright (c) 2015 Nikolaus Piccolotto
 * Licensed under the Apache, 2.0 licenses.
 */

'use strict';

var symdiff = require('symdiff');

function dedup(t, idx, arr) {
    return arr.lastIndexOf(t) === idx;
}

function flatten(prev, cur) {
    Array.prototype.push.apply(prev, cur);
    return prev;
}

module.exports = function(grunt) {
    grunt.registerMultiTask('symdiff', 'Grunt plugin for symdiff', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
                css: [],
                templates: [],
                ignore: []
            }),
            cssClasses = [],
            tplClasses = [];

        // Iterate over all specified file groups.
        this
        .files
        .forEach(function(f) {
            var src =  f.src
                        .filter(function(filepath) {
                            // Warn on and remove invalid source files (if nonull was set).
                            if (!grunt.file.exists(filepath)) {
                                grunt.log.warn('Source file "' + filepath + '" not found.');
                                return false;
                            } else {
                                return true;
                            }
                        })
                        .map(function(filepath) {
                            // Read file source.
                            return grunt.file.read(filepath);
                        });
            src.forEach(function(s) {
                Array.prototype.push.apply(
                    cssClasses,
                    options.css.map(function(plugin) {
                        return plugin(s);
                    }));
            });
            src.forEach(function(s) {
                Array.prototype.push.apply(
                    tplClasses,
                    options.templates.map(function(plugin) {
                        return plugin(s);
                    }));
            });
        });
        cssClasses = cssClasses
                        .reduce(flatten, [])
                        .filter(dedup);
        tplClasses = tplClasses
                        .reduce(flatten, [])
                        .filter(dedup);

        // calculate the result
        var diff = symdiff(cssClasses, tplClasses, options.ignore);
        if (diff.css.length) {
            grunt.fail.warn('Unused CSS classes: ' + diff.css.join(' ') + '\n');
        }
        if (diff.templates.length) {
            grunt.fail.warn('Unused template classes: ' + diff.templates.join(' ') + '\n');
        }
    });

};
