#!/usr/bin/env node

const Crawler = require("crawler");
const url = require('url');
const csv = require('csv');
const fs = require('fs');
const colors = require('colors');
const extend = require('extend');
const path = require('path');
const stringify = csv.stringify;
const parse =  require('csv-parse');
const fileChecker = require('../utils/file-checker');

const y = require('yargs')
    .usage('Usage: $0 oldsite.csv newsite.csv')
    .demandCommand(2)
    .describe('o', 'Output to this file (will just log if omitted)'.blue)
    .help('h');

const argv = y.argv;

// Yes this is confusing, I should change it but oldsite newsite makes
// more sense in args, but the code in 'compare' is very much b is old.
const file2 = process.cwd() + path.sep + argv._[0];
const file1 = process.cwd() + path.sep + argv._[1];


if (!fs.existsSync( file1 ))
{
    throw "Error:".red + file1 + " does not exist".red;
    process.exit();
}

if (!fs.existsSync( file2 ))
{
    throw "Error:".red + file2 + " does not exist".red;
    process.exit();
}



var output1;
var output2;

var p1 = new Promise(function( res, rej ) {
    output1 = fileChecker.readCsv( file1, res, rej);
});

var p2 = new Promise(function( res, rej ) {
    output2 = fileChecker.readCsv( file2, res, rej);
});


Promise.all([p1,p2]).then(function() {
    var c = require('./compare');
    var results = c( output1, output2 );

    // Reorder the results by section
    results.sort(function(a, b) {
        var sectionA = a[3].toUpperCase(); // ignore upper and lowercase
        var sectionB = b[3].toUpperCase(); // ignore upper and lowercase
        if (sectionA < sectionB) {
            return -1;
        }
        if (sectionA > sectionB) {
            return 1;
        }

        // names must be equal
        return 0;
    });

    if (argv.o) {
        fs.writeFileSync(argv.o, '');

        stringify(results, {delimiter: ',', quotedString: true}, function(_err, output){
            fs.appendFile(argv.o, output, function (err) {
                if (err) throw err;
            });
        });
    }
});

