/*

    Handle the arguments passed to the index.js file,
    and return the result.

    The result should either be a fail and an exit,
    or output configuration for the app.

*/

const colors = require('colors');
const extend = require('extend');
const defaults = require('./default-options');
const url = require('url');
const path = require('path');

const y = require('yargs')
    .describe('f', 'Load this config file'.blue)
    .describe('u', 'Load this url'.blue)
    .describe('w', 'If existing logfile is found, overwrite it (otherwise timestamp appended file is created)'.blue)
    .describe('o', 'Output to this file (overrides setting in input file)'.blue)
    .describe('d', 'Dry run - don\'t write to a file'.blue)
    .help('h')

const argv = y.argv;


var _url = argv.u;
var _file = argv.f;

if (!_url && !_file) {
    console.log("You must provide an input file or url".red);
    y.showHelp();
    process.exit();
}




// Create a clone of the defaults, to be our output to the app:
var output = extend({}, defaults);

if (_file) {
    // Clone the output from the config file that was passed:
    extend(output, require( process.cwd() + path.sep + _file ) );
} else {
    // _url is implied to exist:
    output.url = _url;
}

// Create a URL object, so that we can detect host name and the like.
output.urlObject = url.parse( output.url );


// If argument for output file is there, use that,
// which overrides any defaults or passed in config.
if (argv.o) {
    output.logfile = process.cwd() + path.sep + argv.o;
} else if (!output.hasOwnProperty('logfile')) {
    output.logfile = process.cwd() + '/output/' + output.urlObject.hostname + ".csv";
}


if (argv.w) {
    output.rewrite = true;
}

if (argv.d) {
    output.dryRun = true;
}


if (!output.url) {
    console.log("Error - the URL to crawl is not valid: " + "Url Provided: ".red + parent );
    process.exit();
}

module.exports = output;
