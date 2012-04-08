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
        console.log('id: '+curId+'  node: '+node.data.name);

        // get all the outbound relationships
        neo4j.getOutgoingRelationshipsForNode(curId, function(err, relationships) {
            if (err) {
                console.log('err: '+err);
                return;
            }

            if (!relationships || relationships.length == 0) {
                console.log('There were no relationships');
                cb();
                return;
            }

            var children = [];
            for (var i=0; i<relationships.length; ++i) {
                var child_id = neo4j.getIdFromUri(relationships[i].end);
                neo4j.getNode(child_id, function(err, ch_id, node) {
                    console.log('    child_id: '+ch_id+'  node: '+node.data.name);
                });
            }
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
