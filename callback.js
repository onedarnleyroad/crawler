const colors = require('colors');
const url = require('url');


module.exports = function( success, always, parentUrlObj, q, config ) {
    return function (error, result, done) {


        try {
            if (error) {
                if (typeof always === 'function') {
                   always( result );
                }
                console.log( "error", error );
                return;
            } else {
                var $ = result.$;
                var thisUrl = result.request.uri.href;

                if (typeof $ === 'function') {

                    console.log( ("" + result.statusCode).red, "Crawling:".grey + thisUrl, $('head title').text().green );

                    if (typeof success === 'function') {

                        success( thisUrl, $, result );
                    }

                    // Queue more
                    $('a[href]').each(function(index, a) {

                        var toQueueUrl = $(a).attr('href');



                        // If no url, return:
                        if (!toQueueUrl) { return; }

                        // Potentially skip url
                        if (typeof config.skipUrls === "function") {

                            var skipUrl = config.skipUrls( url.parse( toQueueUrl ));

                            if ( skipUrl ) {
                                return;
                            }
                        }

                        var urlObject = url.parse( toQueueUrl );

                        // ignore blank hash
                        if (toQueueUrl.substring(0,1) == '#') { return; }

                        if (urlObject.hostname == null ) {

                            // resolve internal url
                            toQueueUrl = url.resolve(parentUrlObj.href, toQueueUrl);

                            q(toQueueUrl);


                        } else if (parentUrlObj.hostname == urlObject.hostname ) {
                            // hostname matches, it's internal, so crawl
                            q(toQueueUrl);

                        } else {
                            // External link, skip
                            // console.log( ("Skipping " + toQueueUrl).red );
                        }
                    });
                }
            }

            if (typeof always === 'function') {
               always( result );
            }

        } catch(e) {
            console.log( e );
        }

        // Done at end, but consider moving this
        // if we go async.
        done();

    };
};
