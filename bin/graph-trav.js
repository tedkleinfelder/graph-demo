#!/usr/bin/env node

var async = require('async');
var neo4jSimple = require('neo4jSimple').neo4jSimple;
var fs = require('fs');
var util = require('util');
var path = require('path');
var categoryId = {};
var categoryName = {};
var neo4j;
var curId;


function createNeo4jObj(cb) {
    neo4j = new neo4jSimple(function(err) {
        if (err) {
            cb('Error creating neo4jSimple: '+err);
            return;
        }
        cb();
    });
}

function getArg(cb) {
    // print process.argv
    if (process.argv[2] === undefined)
        throw new Error('usage: '+process.argv[1]+'<node id>');
    curId = parseInt(process.argv[2]);
    console.log('curId: '+curId);
    cb();
}

function traverse(cb) {
    // get curId
    neo4j.getNode(curId, function(err, resp, node) {
        if (err) {
            cb('Error: '+err);
            return;
        }

        // get all the outbound relationships
        console.log(node);

        neo4j.getOutgoingRealtionships(curId, function(err, relationships) {
        });
    });
}

function main() {

    // do the following functions, 1 at a time
    async.series(
        [
            createNeo4jObj,     // create the neo4jSimple object
            getArg,
            traverse
        ],

        function(err, results) {
        }
    );
}

// this is how main gets started, we call it.
main();
