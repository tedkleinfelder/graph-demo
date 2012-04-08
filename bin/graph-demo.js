#!/usr/bin/env node

var async = require('async');
var neo4jSimple = require('neo4jSimple').neo4jSimple;
var fs = require('fs');
var util = require('util');
var path = require('path');
var categoryId = {};
var categoryName = {};
var neo4j;
var rootId;

function createNeo4jObj(cb) {
    neo4j = new neo4jSimple(function(err) {
        if (err) {
            cb('Error creating neo4jSimple: '+err);
            return;
        }
        cb();
    });
}

function createRootNode(cb) {
    neo4j.createNodeWithProperties({name: "root"}, function(err, id, node) {
        if (err) {
            cb('createRootNode: '+err);
            return;
        }

        rootId = id;
        categoryId[node.data.name] = id;        // global
        categoryName[id] = node.data.name;      // global

        console.log(node.data.name+': '+id);
        cb();
    });
}

function processCategories(cb) {

    // open file categories text
    fs.readFile('./data/categories.txt', function (err, data) {
        if (err) {
            cb('processCategories: '+err);
            return;
        }

        var categories = data.toString().split('\n');
        if (categories.length === 0) {
            cb('processCategories: No categories!');
            return;
        }

        // process each line in categories.txt to var genre
        for (var i=0; i<categories.length; ++i) {
            if (categories[i].length)
                createCategoryNodeAndHandleSubs(categories[i], cb);
        }
    });
}

function createCategoryNodeAndHandleSubs(nodeName, cb) {

    neo4j.createNodeWithProperties({name: nodeName}, function(err, id, node) {
        if (err)
            throw new Error('createNode: '+err);

        categoryId[node.data.name] = id;        // global
        categoryName[id] = node.data.name;      // global
        console.log('  '+node.data.name+': '+id);

        // create a relationship
        neo4j.createRelationship(rootId, id, 'child', {}, function(err, relId, rel) {
            var subGenreFile = './data/sub_'+node.data.name+'.txt';

            //  if file subGenreFile exists
            if (path.existsSync(subGenreFile)) {
                process_sub_genres(subGenreFile, id, function (err) {
                    if (err)
                        throw new Error('Error: '+err);
                });
            }
        });
    });
}

function process_sub_genres(subGenreFile, parentId, cb) {
    // open file subGenreFile
    fs.readFile(subGenreFile, function (err, data) {
        if (err)
            throw new Error('process_sub_genres: '+err);
 
        var subCategories = data.toString().split('\n');
        if (subCategories.length === 0)
            return;

        for (var i=0; i<subCategories.length; ++i) {
            if (subCategories[i].length == 0)
                continue;
            var props = {
                name: subCategories[i],
                parentName: categoryName[parentId],
                parentId: parentId
            };
            neo4j.createNodeWithProperties(props, function(err, id, node) {
                if (err)
                    throw new Error('createNode: '+err);
                categoryId[node.data.name] = id;        // global
                categoryName[id] = node.data.name;      // global
                console.log('    '+node.data.name+': '+id);
                neo4j.createRelationship(parentId, id, 'child', {}, function(err, relId, rel) {
                    if (err)
                        throw new Error('createNode: '+err);
                    cb();
                });
            });
        }
    });
}

function main() {

    // do the following functions, 1 at a time
    async.series(
        [
            createNeo4jObj,     // create the neo4jSimple object
            createRootNode,     // root of tree
            processCategories   // process categories & subs
        ],

        function(err, results) {
        }
    );
}

// this is how main gets started, we call it.
main();
