
module.exports = {
    url: 'http://chapmantaylor.craft.dev',
    skipUrls: function( urlobject ) {
        // return true if url is to be skipped.
        if (!urlobject) {
            return true;
        }

        if ( typeof urlobject.path === "string" && urlobject.path.substring(0,3) === '/zh' ) {
            //console.log("Skipping" + urlobject.path );
            return true;
        } else {
            return false;
        }


        process.exit();
    }
};
