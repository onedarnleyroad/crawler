#!/usr/bin/env node

const csv = require('csv');
const parse =  require('csv-parse');
const fs = require('fs');
const colors = require('colors');
const url = require('url');
const extend = require('extend');
const path = require('path');
const Crawler = require("crawler");
const stringify = require('csv').stringify;

const y = require('yargs')
    .describe('i', 'input csv file'.blue)
    .describe('t', 'target url to try new links')
    .describe('o', 'Output to this file'.blue)
    .describe('d', 'Dry run - don\'t write to a file'.blue)
    .describe('v', 'Verbose(ish) Mode'.blue)
    .describe('e', 'Only log errors, eg 404 or 500'.blue)
    .describe('w', 'overwrite existing files (appends timestamp if omitted)'.blue)
    .demandOption(['i','o','t'])
    .help('h');



const argv = y.argv;

const inputFile = process.cwd() + path.sep + argv.i;
const _outputFile = process.cwd() + path.sep + argv.o;
const doRewrite = argv.w;
const isDryRun = argv.d;
const targetUrl = argv.t;

const fileChecker = require('../utils/file-checker.js');


fileChecker.existOrExit( inputFile, isDryRun );
// inputFile must exist, or script would be dead

var outputFile = fileChecker.validateOutput( _outputFile, doRewrite, isDryRun, argv.v );
if (!outputFile) { process.exit(); }


var Target = url.parse( targetUrl );

if (!Target.protocol) {
    Target = url.parse( "http://" + targetUrl );
}

var results = [], input = [];

var _process = function(error, result, done) {
    if (error) {
        console.log( error );
    } else {

        var fCode = result.statusCode, isError;

        if (result.statusCode == 404) {
            fCode = ("" + result.statusCode).red;
            isError = true;
        }

        if (result.statusCode == 500) {
            fCode = ("" + result.statusCode).blue;
            isError = true;
        }

        if (result.statusCode == 200) {
            fCode = ("" + result.statusCode).green;
        }

        if (argv.v) {
            console.log( ((isError) ? "err".red : " ok".green), fCode, "Crawling:".grey + result.request.uri.href );
        }


        if (isError || !argv.e) {

            var row = [
                result.statusCode,
                (isError) ? "error" : "ok",
                result.request.uri.href
            ];

            // If we need this:
            results.push(row);

            stringify([row], {delimiter: ',', quotedString: true}, function(_err, output){
                if (!isDryRun) {
                    fs.appendFile(outputFile, output, function (err) {
                        if (err) throw err;
                    });
                }
            });
        }
    }

    done();
};

var c = new Crawler( {

        // Crawler values
        skipDuplicates: true,
        // memory may crap out if it's done too fast, for big sites,
        // so limiting the rate to 25ms and also thus 1 connection at a time, will
        // generally allow the task to complete.

        // setting false means it'll not limit and have more than one connection.
        rateLimits: 5,

        // if rateLimits is anything other than false this is ignored.
        maxConnections: 10,

        callback: _process
} );


var readInput = new Promise(function( res, rej ) {
    input = fileChecker.readCsv( inputFile, res, rej);
});

readInput.then( () => {
    /* etc */
    input.forEach( function( row ) {

        var thisUrl = url.parse( row[0] );
        thisUrl.host = Target.host;

        var toQueue = url.format( thisUrl );
        if (argv.v) {
            console.log( "Queueing ".grey + toQueue );
        }
        c.queue( toQueue );

    });
});





// c.on('drain', function() {

//     if (argv.v) {
//         console.log("Done");
//     }

//     //if (!isDryRun) {
//         // console.log( results );
//         // stringify(results, function(err, output){
//             // process.exit();
//         // });
//     //};
// });












