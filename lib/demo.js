var neo4jSimple = require('../neo4jSimple.js').neo4jSimple;
var fs = require('fs');
var util = require('util');
var path = require('path');
var categoryId = {};
var categoryName = {};
var neo4j;

function main() {
    // create neo4j object
    neo4j = new neo4jSimple(function(err) {
        if (err) {
            console.error('Error creating neo4jSimple: '+err);
            process.exit(1);
        }
        // open file categories text
        fs.readFile('categories.txt', function (err, data) {
            if (err) throw err;
            console.log(data.toString());
            var categories = data.toString().split('\n');
            if (categories.length === 0)
                throw new Error('No categories!');
            // process each line in categories.txt to var genre
            //      create node with name genre
            //          store id in genreId
            for (var i=0; i<categories.length; ++i) {
                var genre = 'sub_'+categories[0]+'.txt';
                neo4j.createNodeWithProperties({name: categories[i]}, function(err, id, node) {
                    if (err) {
                        throw new Error('createNode: '+err);
                    }
                    categoryId[node.data.name] = id;
                    categoryName[id] = node.data.name;
                    //console.log('node: '+util.inspect(node));
                    var subGenreFile = 'sub_'+node.data.name+'.txt';
                    //      if file subGenreFile exists
                    if (path.existsSync(subGenreFile)) {
                        process_sub_genres(subGenreFile, id, function (err) {
                            if (err) {
                                throw new Error('Error: '+err);
                            }
                        });
                    }
                });
            }
        });

    });
}

function process_sub_genres(subGenreFile, parentId, cb) {
    // open file subGenreFile
    fs.readFile(subGenreFile, function (err, data) {
        if (err) throw err;
        console.log(data.toString());
        var subCategories = data.toString().split('\n');
        if (subCategories.length === 0)
            return;
        for (var i=0; i<subCategories.length; ++i) {
            var props = {
                name: subCategories[i],
                parentName: categoryName[parentId],
                parentId: parentId
            };
            neo4j.createNodeWithProperties(props, function(err, id, node) {
                if (err) {
                    throw new Error('createNode: '+err);
                }
                console.log('node: '+util.inspect(node));
                cb();
            });
        }
    });
}

main();
