var Crawler = require("crawler");
var url = require('url');
var stringify = require('csv').stringify;
var fs = require('fs');
var colors = require('colors');



var parent = process.argv[2];

console.log( "Crawling ".grey + parent + "...".green);


var data = [];
var parentUrlObj = url.parse( parent );



var logfile = parentUrlObj.hostname + ".txt";

fs.writeFileSync(logfile, ''); // setup new file


var urlsCrawled = [];

// setup CSV writer
stringifier = stringify({delimiter: ','});


var c = new Crawler({
    skipDuplicates: true,
    // memory craps out if it's done too fast, for big sites,
    // so limiting the rate to 25ms and also thus 1 connection at a time, will
    // generally allow the task to complete.
    rateLimits: 5,

    // This will be called for each crawled page

    callback : function (error, result, done) {


        try {
            if (error) {
                console.log( error );
                return;
            } else {
                var $ = result.$;
                var thisUrl = result.request.uri.href;

                if (urlsCrawled.indexOf( result.request.uri ) === -1) {

                    if (typeof $ === 'function') {

                        console.log( ("" + result.statusCode).red, "Crawling:".grey + thisUrl, $('head title').text().green );

                        data.push([ thisUrl, $('head title').text()]);

                        $('a[href]').each(function(index, a) {

                            var toQueueUrl = $(a).attr('href');

                            // If no url, return:
                            if (!toQueueUrl) { return; }


                            var urlObject = url.parse( toQueueUrl );

                            // ignore blank hash
                            if (toQueueUrl.substring(0,1) == '#') { return; }

                            if (urlObject.hostname == null ) {

                                // resolve internal url
                                toQueueUrl = url.resolve(parent, toQueueUrl);
                                c.queue(toQueueUrl);

                            } else if (parentUrlObj.hostname == urlObject.hostname ) {
                                // hostname matches, it's internal, so crawl
                                c.queue(toQueueUrl);
                            } else {
                                // External link, skip
                                // console.log( ("Skipping " + toQueueUrl).red );
                            }
                        });
                    }
                }
            }

            urlsCrawled.push(result.request.uri);

        } catch(e) {
            console.log( e );
        }

        // Done at end, but consider moving this
        // if we go async.
        done();

    }
});

c.queue( parent );

c.on('drain', function() {
    console.log("Done?");
    stringify(data, function(err, output){
        fs.writeFileSync(logfile, output); // setup new file
        process.exit();
    });

});


