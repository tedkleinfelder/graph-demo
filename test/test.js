/**
 * @fileoverview A set of tests for the neo4jSimple object. When you execute this script,
 * the tests will all execute and, if there are no errors, the process exits with 0,
 * the exit value is 1 otherwise.
 *
 * @author <a href="mailto:edmond.meinfelder@gmail.com">Edmond Meinfelder</a>
 */
var neo4jSimple = require('neo4jSimple').neo4jSimple;
var async = require('async');
var assert = require('assert');
var util = require('util');
var neo4j;



var doSomething = function(cb) {
    cb();
};


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


/**
 * Executes the testssequentially and handles the exit value.
 */
function do_tests() {
    async.series(
        [
            doSomething
        ],

        // async callback
        function(err, results) {
            if (err)  {
                console.log('Err: '+err);
                process.exit(1);
                return;
            }
            console.log('There are no tests yet - please add some!');
            process.exit(0);
        }
    );
}

/**
 * Create the neo4j object and run the test driver, do_tests()
 */
function main() {
    neo4j = new neo4jSimple(function(err) {
        if (err) {
            console.error('Error creating neo4jSimple: '+err);
            process.exit(1);
        }
        do_tests();
    });
}

main();     // Causes all the tests to run.
