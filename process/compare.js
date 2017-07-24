const fuzzy = require('fuzzy');
const colors = require('colors');


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
    var r = /P[0-9]+/;

    // don't return /en/ suffix, or /P23 sufffix
    if ( last.length == 2 || last.match( r ) ) {
        return false;
    }

    var section = row[3] || "";

    if (!B.sections.hasOwnProperty(section)) {
        B.sections[section] = [];
    }

    var thisObj = {
        section: section,
        url: url,
        title: title
    };

    B.sections[section].push( thisObj );

    return thisObj;

};


var _aTransformer = function( row ) {

    var section = row[2] || "";
    var url = row[0] || "";
    var title = row[1] || "";

    if (!A.sections.hasOwnProperty( section ) ) {
        A.sections[section] = [];
    }



    A.sections[section].push( {
        section: section,
        url: url,
        title: title
    } );
};


/*=====  End of Hard coded Chapman Taylor bit  ======*/


// Block for 'seconds' seconds. Helps with understanding the logs,
// but is otherwise totally useless!
var _wait = function( seconds ) {
    var waitTill = new Date(new Date().getTime() + seconds * 1000);
    while(waitTill > new Date()){}
};

module.exports = function( a, b ) {

    var seconds = 0.05;

    var list = [];
    a.forEach( _aTransformer );

    var fuzzyOptions = {
        extract: function(e) {
            return e.url
        }
    };

    for (var _s in A.sections ) {
        console.log( _s );
    }


    b.forEach( function( r ) {

        var bits = _bTransformer(r);
        if (bits) {

            console.log("Section:".grey, bits.section );

            if ( A.sections.hasOwnProperty( bits.section ) ) {

                console.log("Searching for " + bits.url.blue + " in " + bits.section.green );
                var results = fuzzy.filter(bits.title, A.sections[bits.section], fuzzyOptions);

                var matches = results.map(function(el) { return el.string; });
                console.log(matches);
                console.log("---------------------------------".grey);

            } else {
                console.log(("No " + bits.section + " in B").red);
            }


            _wait(0.1);

        }

    });

};
