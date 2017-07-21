const fuzzy = require('fuzzy');



/*=====================================================
=            Hard coded Chapman Taylor bit            =
=====================================================*/

var _bTransformer = function( row ) {

    var url = row[0];
    var title = row[1];
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

    return row.splice(3, row.length );

};


var _aTransformer = function( row ) {

};


/*=====  End of Hard coded Chapman Taylor bit  ======*/



module.exports = function( a, b ) {

    var seconds = 0.05;

    var list = [];
    a.forEach( function( r ) {
        list.push({
            u: r[0],
            t: r[1],
            p: r.splice(2, r.length).join(' ')
        });
    });

    var fuzzyOptions = {
        extract: function(e) {
            return e.u
        }
    };

    b.forEach( function( r ) {

        var bits = _bTransformer(r);
        if (bits) {
            var s = bits.join(' ');

            var results = fuzzy.filter( s, list, fuzzyOptions );
            var matches = results.map(function(el) { return el.string; });

            console.log( r[0], matches.length );
        }

        var waitTill = new Date(new Date().getTime() + seconds * 1000);
        while(waitTill > new Date()){}
    });

};
