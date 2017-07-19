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

var urlsCrawled = 0;
var urlsQueued = 0;
var urlsProcessed = 0;
var urlsSkipped = 0;

var urls = [];

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

        urlsCrawled++;

    },

    // always
    function( result ) {

        urlsProcessed++;
        urlsSkipped = urlsProcessed - urlsCrawled;

        console.log( ( urlsCrawled + " crawled, ").green,  (urlsQueued + " queued").red, (urlsSkipped + " skipped").grey);
    },

    // parent
    parentUrlObj,

    // queue function:
    function( u ) {
        if ( urls.indexOf( u ) === -1 ) {
            urls.push( u );
            urlsQueued++;
            c.queue( u );
        }
    },

    // config
    config
);





// Create options, but always ensure that callback
// is overridden
var crawlerOptions = extend({}, config.crawler, {
    callback: callback
});


c = new Crawler( crawlerOptions );

c.queue( parent );

c.on('drain', function() {
    console.log("Done?");
    stringify(data, function(err, output){
        process.exit();
    });

});


