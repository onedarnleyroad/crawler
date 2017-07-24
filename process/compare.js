
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
}

var _bTransformer = function( row ) {

    var url = row[0] || "";
    var title = row[1] || "";
    var langPrefix = row[2];

    // Don't process uploads
    if (langPrefix === 'uploads') {
        return false;
    }

    var last = row[ row.length - 1 ];
    var r = /P[0-9]+$/i;

    // don't return /en/ suffix, or /P23 sufffix
    if ( last.match( r ) ) {
        return false;
    }

    // Skip non /en suffixes.
    if ( last.length === 2 && last != 'en') {
        // console.log( last.rainbow );
        return false;
    }

    if (last.length === 2 && last === 'en') {
        last = row[ row.length - 2 ];
    }


    var section = row[3] || "";

    if (!B.sections.hasOwnProperty(section)) {
        B.sections[section] = [];
    }

    var search = row.splice(3, row.length).join(' ').replace(/\-/g, ' ');

    var thisObj = {
        section: section,
        search: search,
        url: url,
        title: title,
        last: last
    };

    B.sections[section].push( thisObj );

    return thisObj;

};


var _aTransformer = function( row ) {

    var section = row[2] || "";
    var url = row[0] || "";
    var title = row[1] || "";

    var last = row[ row.length - 1 ];

    var r = /p[0-9]+$/i;

    // don't return /P23 sufffix
    if ( last.match( r ) ) {
        return false;
    }

    if (!A.sections.hasOwnProperty( section ) ) {
        A.sections[section] = [];
    }

    var last = row[ row.length - 1 ];

    var search = last.replace(/\-/g, ' ');


    A.sections[section].push( {
        section: section,
        search: search,
        url: url,
        title: title,
        last: last
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

            // console.log("Section:".grey, bits.section );

            if ( A.sections.hasOwnProperty( bits.section ) ) {

                // console.log("Searching for " + bits.search.blue + " in " + bits.section.green );

                // console.log("--URLS:-------------------------------".grey);
                for (var i in A.sections[bits.section] ) {
                    var row = A.sections[bits.section][i];

                    if (row) {
                        var _score = score( bits.last, row.last, 0.25 );
                        // if (_score > 0.2) {
                            if (_score > 0.5 && _score < 1) {
                                console.log( ( _score + "").blue, bits.url.green, row.url.red );
                                results.push({
                                    score: _score,
                                    old: bits,
                                    new: row
                                });

                            } else if (_score === 1) {

                            }

                        // }
                    }

                }
                // console.log("--------------------------------------".grey);


            } else {
                // console.log(("No " + bits.section + " in B").red);
            }




        }

    });

    console.log( results.length );

};
