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
    symbols = require('log-symbols'),
    path = require('path'),
    extensions = [
        {name: 'html', type: 'templates'},
        {name: 'hbs', type: 'templates'},
        {name: 'jade', type: 'templates'},
        {name: 'jsx', type: 'templates'},
        {name: 'css', type: 'css'},
        {name: 'sass', type: 'css'},
        {name: 'scss', type: 'css'},
        {name: 'less', type: 'css'},
        {name: 'styl', type: 'css'}
    ];

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
                var fileType = _.result(_.find(extensions, function (ext) {
                        return ext.name === (path.extname(file[0])).split('.')[1];
                    }), 'type'),
                    s = file[1],
                    classes = options[fileType]
                                .map(function (plugin) {
                                    return plugin(s);
                                })
                                .reduce(flatten, [])
                                .filter(dedup);

                classesPerFile[file[0]] = classes;
                Array.prototype.push.apply(
                    (fileType === 'templates' ? tplClasses : cssClasses),
                    classes);
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
                    perFileDiff.join(' ') ['blue']
                ]);
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
