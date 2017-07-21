#!/usr/bin/env node

const Crawler = require("crawler");
const url = require('url');
const csv = require('csv');
const fs = require('fs');
const colors = require('colors');
const extend = require('extend');
const path = require('path');

const parse =  require('csv-parse');


const y = require('yargs')
    .usage('Usage: $0 file1 file2')
    .demandCommand(2)
    .help('h');

const argv = y.argv;

const file1 = process.cwd() + path.sep + argv._[0];
const file2 = process.cwd() + path.sep + argv._[1];


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

var _readFile = function( inputFile, resolve, rej ) {

    console.log( inputFile );

    var parser = parse({relax_column_count: true});
    var output = [];

    parser.on('readable', function(){
        while(record = parser.read()){
            // console.log( record );
            output.push(record);
        }
    });

    var input = fs.readFile( inputFile, (err, data) => {
        parser.write( data );
         resolve();
    });

    parser.on('error', function(err){
        console.log( "Error", err );
        rej();
        process.exit();
    });

    return output;

};

var output1;
var output2;

var p1 = new Promise(function( res, rej ) {
    output1 = _readFile( file1, res, rej);
});

var p2 = new Promise(function( res, rej, rej ) {
   output2 = _readFile( file2, res );
});


Promise.all([p1,p2]).then(function() {
    var c = require('./compare');
    c( output1, output2 );
});





