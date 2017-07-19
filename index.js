const Crawler = require("crawler");
const url = require('url');
const stringify = require('csv').stringify;
const fs = require('fs');
const colors = require('colors');
const extend = require('extend');
const path = require('path');

//
const config = require('./args');
const parentUrlObj = config.urlObject;
const parent = config.url;

console.log( "Crawling ".grey + parent + "...".green);

// store our output
var data = [];
var c;



/*----------  Create File for Writing  ----------*/

if (!config.dryRun) {

    var logfileExists = fs.existsSync( config.logfile );
    var logfile = path.parse( config.logfile );
    var logfileName = config.logfile

    if ( logfileExists && config.rewrite) {
        console.log( "logfile exists, Rewrite is ".grey + "true".green + ", so emptying ".grey + logfileName.blue);
        fs.writeFileSync(logfileName, '');
    } else if (logfileExists) {
        var timestamp = new Date().getTime();

        // Rename with timestamp added.
        logfile.name = logfile.name + "_" + timestamp;
        logfile.base = false;
        logfileName = path.format( logfile );
        console.log( "logfile exists, Rewrite is ".grey + "false".red + ", so using output file ".grey + logfileName.blue);
        fs.writeFileSync(logfileName, '');
    }
} else {
    console.log("Dry run - not writing to any files".rainbow);
}

/*----------  Make Callback to be called when we loop through  ----------*/


// makes a callback that executes but also crawls for more links:
var makeCallback = require('./callback');

var callback = makeCallback(

    // Success
    function( thisUrl, $, result ) {
        // We can assume these are okay, as the
        // check for these is performed before the success component
        var row = [
            thisUrl,
            $('head title').text()
        ];

        var urlObj = url.parse( thisUrl );
        urlObj.path.split('/').forEach(function( chunk ) {
            if (chunk.trim()) {
                row.push( chunk );
            }
        });


        stringify([row], {delimiter: ',', quotedString: true}, function(_err, output){
            if (!config.dryRun) {
                fs.appendFile(logfileName, output, function (err) {
                    if (err) throw err;
                });
            }
        });
    },

    // always
    function( result ) {
    },

    // parent
    parentUrlObj,

    // queue function:
    function( u ) {
        c.queue( u );
    }
);









c = new Crawler({
    skipDuplicates: true,
    // memory craps out if it's done too fast, for big sites,
    // so limiting the rate to 25ms and also thus 1 connection at a time, will
    // generally allow the task to complete.
    rateLimits: 5,

    // This will be called for each crawled page
    callback: callback
});

c.queue( parent );

c.on('drain', function() {
    console.log("Done?");
    stringify(data, function(err, output){
        process.exit();
    });

});


