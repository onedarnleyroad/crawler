#!/usr/bin/env node

const csv = require('csv');
const parse =  require('csv-parse');
const fs = require('fs');
const colors = require('colors');
const url = require('url');

const path = require('path');

const y = require('yargs')
    .describe('i', 'input csv file'.blue)
    .describe('o', 'Output to this file'.blue)
    .describe('d', 'Dry run - don\'t write to a file'.blue)
    .describe('v', 'Verbose(ish) Mode'.blue)
    .describe('w', 'overwrite existing files (appends timestamp if omitted)'.blue)
    .demandOption(['i','o'])
    .help('h');

const argv = y.argv;

const inputFile = process.cwd() + path.sep + argv.i;
const _outputFile = process.cwd() + path.sep + argv.o;
const doRewrite = argv.w;
const isDryRun = argv.d;


if (!isDryRun) {
    if (!fs.existsSync( inputFile ))
    {
        console.log("Error:".red + inputFile + " does not exist".red);
        process.exit();
    }
} else {
    console.log("------------------------------------".rainbow);
    console.log("DRY RUN, not writing to file".red);
    console.log("------------------------------------".rainbow);
}

// Check if output exists
const outputFileExists = fs.existsSync( _outputFile );


/*----------  Check output file:  ----------*/
if (doRewrite && outputFileExists) {

    // Warn user we are overwriting:
    console.log( "output file " + _outputFile.red + " exists, Rewrite is ".grey + "true".green + ", so clearing and rewriting file");
    var outputFile = _outputFile;

} else if (outputFileExists) {

    var timestamp = new Date().getTime();
    var logfile = path.parse( _outputFile );

    // Rename with timestamp added.
    logfile.name = logfile.name + "_" + timestamp;
    logfile.base = false;
    // Store true output filename
    var outputFile = path.format( logfile );
    console.log( "logfile exists, Rewrite is ".grey + "false".red + ", so using output file ".grey + outputFile.blue);

} else {
    // It's a new file:
    var outputFile = _outputFile;
}

// Create, or blank, the output file.

if (isDryRun) {
    console.log("[DRY RUN] - Would write to ".grey + outputFile);
} else {
    fs.writeFileSync(outputFile, '');
}



var _readFile = function( inputFile, resolve, rej ) {


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

var _data;
var p1 = new Promise(function( res, rej ) {
    _data = _readFile( inputFile, res, rej);
});


var count = 0;
Promise.all([p1]).then(function() {
    _data.forEach( _process_row );
    console.log("added " + count + " lines");
});


/*================================================
=            Process data to htaccess            =
================================================*/
var _process_row = function( row ) {

    var score = Number( row[0] );
    var from = url.parse(row[1]);
    var to = url.parse(row[2]);
    var section = row[3];
    var output, outputFormatted;

    // Just silently fail if no from
    if (!row[1]) { return; }


    // type convert, it's a CSV:
    if (score == 1 && to ) {
        // output += ""
        // output = "RedirectMatch 301 ^" + from.pathname + " " + to.pathname;
        output = "RedirectMatch 301 ^" + from.pathname + " " + to.pathname;
        outputFormatted = "RedirectMatch 301 ^".grey + from.pathname.red + " " + to.pathname.green;
    }

    if (!row[2]) {
        output = "RedirectMatch 301 " + ("^" + from.pathname) + (" /" + section);
        outputFormatted = "RedirectMatch 301 ".grey + ("^" + from.pathname).red + (" /" + section).green;
    }


    count++;

    if (argv.v) {
        console.log( outputFormatted );
    }

    // Suffix with a line
    if (output) {
        if (argv.v) {
            console.log( outputFormatted );
        }
        output = output + '\n';
        if (!isDryRun) {
            fs.appendFile(argv.o, output, function (err) {

            });
        }
    } else if (argv.v) {
        console.log( "No output for ".grey + from.href.red  )
    }
};
/*=====  End of Process data to htaccess  ======*/



