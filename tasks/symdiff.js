/*
 * grunt-symdiff
 * https://github.com/symdiff/grunt-symdiff
 *
 * Copyright (c) 2015 Nikolaus Piccolotto
 * Licensed under the Apache, 2.0 licenses.
 */

'use strict';

var symdiff = require('symdiff'),
    _ = require('lodash'),
    symbols = require('log-symbols');

function dedup(t, idx, arr) {
    return arr.lastIndexOf(t) === idx;
}

function flatten(prev, cur) {
    Array.prototype.push.apply(prev, cur);
    return prev;
}

module.exports = function (grunt) {
    grunt.registerMultiTask('symdiff', 'Grunt plugin for symdiff', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
                css: [],
                templates: [],
                ignore: []
            }),
            classesPerFile = {},
            cssClasses = [],
            tplClasses = [];

        // Iterate over all specified file groups.
        this
        .files
        .forEach(function (f) {
            var src = f.src
                        .filter(function (filepath) {
                            // Warn on and remove invalid source files (if nonull was set).
                            if (!grunt.file.exists(filepath)) {
                                grunt.log.warn('Source file "' + filepath + '" not found.');
                                return false;
                            } else {
                                return true;
                            }
                        })
                        .map(function (filepath) {
                            // Read file source.
                            return [filepath, grunt.file.read(filepath)];
                        });

            src.forEach(function (file) {
                var s = file[1],
                    css = options
                                .css
                                .map(function (plugin) {
                                    return plugin(s);
                                })
                                .reduce(flatten, [])
                                .filter(dedup),
                    tpl = options
                                .templates
                                .map(function (plugin) {
                                    return plugin(s);
                                })
                                .reduce(flatten, [])
                                .filter(dedup),
                    classes = css.concat(tpl);
    
                classesPerFile[file[0]] = classes;

                // it should really not happen that both css and template plugins
                // find classes _in the same file_ because usually a file isn't
                // both at the same time
                if (css.length && tpl.length) {
                    grunt.log.writeln.apply(this, [
                        symbols.warning,
                        'Please report this in github.com/symdiff/grunt-symdiff:\n' ['yellow'],
                        'Ambiguous file ' + file[0] + '\n',
                        'Classes found: ' + classes.join(' ') + '\n',
                        'CSS plugins: ' + options.css.map(function (fn) {
                            return fn.name;
                        }) + '\n',
                        'Template plugins: ' + options.templates.map(function (fn) {
                            return fn.name;
                        }) + '\n',
                                               'Source:\n' + s
                                           ]);
                }
                if (css.length) {
                    Array.prototype.push.apply(
                        cssClasses,
                        classes);
                }
                if (tpl.length) {
                    Array.prototype.push.apply(
                        tplClasses,
                        classes);   
                }
            });
        });
        // calculate the result
        var diff = symdiff(cssClasses, tplClasses, options.ignore),
            joinedDiff = diff.css.concat(diff.templates),
            outputLines = [];


        Object
        .keys(classesPerFile)
        .forEach(function (filename) {
            var classes = classesPerFile[filename],
                perFileDiff = _.intersection(classes, joinedDiff);
            
            if (perFileDiff.length) {
                outputLines.push([
                    symbols.error,
                    filename ['red'],
                    'contains unused classes:',
                    perFileDiff.join(' ') ['blue']]);
            }
        });

        outputLines
        .forEach(function (line) {
            grunt.log.writeln.apply(this, line);
        });

        if (diff.css.length || diff.templates.length) {
            grunt.fail.warn('symdiff encountered unused classes', '\n');
        }

    });

};
