


module.exports = {

    rewrite: false,
    dryRun: false,
    skipUrls: false,

    crawler: {
        // Crawler values
        skipDuplicates: true,
        // memory may crap out if it's done too fast, for big sites,
        // so limiting the rate to 25ms and also thus 1 connection at a time, will
        // generally allow the task to complete.

        // setting false means it'll not limit and have more than one connection.
        rateLimits: 5,

        // if rateLimits is anything other than false this is ignored.
        maxConnections: 10
    }


};
