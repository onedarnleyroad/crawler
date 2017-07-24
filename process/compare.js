
const colors = require('colors');
const score = require('string-score');

/*=====================================================
=            Hard coded Chapman Taylor bit            =
=====================================================*/

var B = {
    sections: {}
};

var A = {
    sections: {}
};

var _bTransformer = function( row ) {

    var url = row[0] || "";
    var title = row[1] || "";
    var langPrefix = row[2];

    // Don't process uploads
    if (langPrefix === 'uploads') {
        return false;
    }

    var slug = row[ row.length - 1 ];
    var r = /P[0-9]+$/i;

    // don't return /en/ suffix, or /P23 sufffix
    if ( slug.match( r ) ) {
        return false;
    }

    // Skip non /en suffixes.
    if ( slug.length === 2 && slug != 'en') {
        // console.log( slug.rainbow );
        return false;
    }

    if (slug.length === 2 && slug === 'en') {
        slug = row[ row.length - 2 ];
    }


    var section = row[3] || "";

    if (!B.sections.hasOwnProperty(section)) {
        B.sections[section] = [];
    }


    var thisObj = {
        section: section,
        url: url,
        title: title,
        slug: slug
    };

    B.sections[section].push( thisObj );

    return thisObj;

};


var _aTransformer = function( row ) {

    var section = row[2] || "";
    var url = row[0] || "";
    var title = row[1] || "";

    var slug = row[ row.length - 1 ];

    var r = /p[0-9]+$/i;

    // don't return /P23 sufffix
    if ( slug.match( r ) ) {
        return false;
    }

    if (!A.sections.hasOwnProperty( section ) ) {
        A.sections[section] = [];
    }

    A.sections[section].push( {
        section: section,
        url: url,
        title: title,
        slug: slug
    } );
};

/*=====  End of Hard coded Chapman Taylor bit  ======*/


// Block for 'seconds' seconds. Helps with understanding the logs,
// but is otherwise totally useless!
var _wait = function( seconds ) {
    var waitTill = new Date(new Date().getTime() + seconds * 1000);
    while(waitTill > new Date()){}
};

var c = 0;

var results = [];

module.exports = function( a, b ) {

    var seconds = 0.05;

    var list = [];
    a.forEach( _aTransformer );

    var fuzzyOptions = {
        extract: function(e) {
            return e.search
        }
    };

    for (var _s in A.sections ) {
        // console.log( _s );
    }

    b.forEach( function( r ) {

        var bits = _bTransformer(r);

        if (bits) {

            var match = false;

            // console.log("Section:".grey, bits.section );
            if ( A.sections.hasOwnProperty( bits.section ) ) {
                // console.log("Searching for " + bits.search.blue + " in " + bits.section.green );
                // console.log("--URLS:-------------------------------".grey);
                for (var i in A.sections[bits.section] ) {
                    var row = A.sections[bits.section][i];

                    if (row) {
                        var _score = score( bits.slug, row.slug, 0.2 );
                        // if (_score > 0.2) {
                            if ( _score > 0.7 ) {
                                match = true;
                                console.log( ( _score + "").blue, bits.url.green, row.url.red );
                                results.push([
                                    _score,
                                    bits.url,
                                    row.url,
                                    bits.section
                                ]);
                            }
                        // }
                    }
                }

            }

            if (!match) {
                results.push([
                    0,
                    bits.url,
                    false,
                    bits.section
                ]);
            }
        }
    });

    return results;

};
