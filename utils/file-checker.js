
const fs = require('fs');
const colors = require('colors');
const url = require('url');
const parse =  require('csv-parse');

// Store the timestamp so it syncs on inclusion of this script.
var timestamp = new Date().getTime();

module.exports = {


    existOrExit: function( inputFile , isDryRun) {
        if (!fs.existsSync( inputFile ))
        {
            console.log("Error:".red + inputFile + " does not exist".red);
            process.exit();
        }
    },


    validateOutput: function( _outputFile, doRewrite, isDryRun, verbose ) {

        if (isDryRun) {
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

            if (verbose) {
                console.log("Creating empty file: " + outputFile );
            }

            fs.writeFileSync(outputFile, '');
        }


        return outputFile;

    },

    // requires a promise resolve and reject passed, eg:
    // var p1 = new Promise(function( res, rej ) {
    // output1 = fileChecker.readCsv( file1, res, rej);
    // });
    //
    // p1.then( () => { /* etc */ });
    readCsv: function( inputFile, resolve, rej ) {

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

    }

};





