import Future from 'fibers/future';
import MovieDB1 from 'moviedb';
var MovieDB = new MovieDB1('23290308516dcbfcb67fb0f330028492');

import walk from 'walkdir';
import walk2 from 'walk';
import fs from 'fs';
import mime from 'mime';
import path from 'path';


//var Future = Meteor.npmRequire('fibers/future');
var base_url = "http://image.tmdb.org/t/p/w396";
var run = 0;
var finished = 0;

Meteor.methods({
    
    
    updateMovieDescription: function(id, section, description) {

        Movies.update({
                _id: id,
                section: section
            },
            {
                $set: {
                    overview: description,
                }

            },
            function(err, res) {
                if (err) {
                    throw err;
                }
                else {
                    return "Updated the description.";
                }
            });

    },
    
    countMovies: function(section) {
            
           var count = Movies.find({
                section: section
            });
            
            //console.log(count.count());
            return count.count();
            
            


    },


    removeMovie: function(id, section) {

        Movies.remove({
                _id: id,
                section: section
            },
            function(err, res) {
                if (err) {
                    throw err;
                }
                else {
                    return "Removed the movie.";
                }
            });

    },



    searchMovie: function(name) {
        var future = new Future();
        //var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

        MovieDB.searchMovie({
            query: name
        }, function(error, result) {

            if (error) {

                future.return(error);

            }
            else {

                var movie = result;

                future.return(result);


            }

        });

        return future.wait();





    },



    movieEqual: function(movie, name2) {
        var future = new Future();


        if (movie === name2) { // If the original title is the same as the one extracted
            future.return(name2 + " IS EQUAL TO: " + movie);

        }
        else {

            future.return(name2 + " isn't equal to: " + movie);

        }

        return future.wait();

    },

    findMovies: function() {


        return Movies.find().fetch();

    },


    movieInfo: function(id) {
        var future = new Future();
        //var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');


        MovieDB.movieInfo({
            id: id
        }, function(error, result) {
            if (error) {
                future.return(error);
            }
            else {
                future.return(result);
            }
        });
        return future.wait();
    },
    
    
    movieImages: function(id) {
        var future = new Future();
        //var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');


        MovieDB.movieImages({
            id: id
        }, function(error, result) {
            if (error) {
                future.return(error);
            }
            else {
                future.return(result);
            }
        });
        return future.wait();
    },

    movieCredits: function(id) {
        var future = new Future();
        //var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');


        MovieDB.movieCredits({
            id: id
        }, function(error, result) {
            if (error) {
                future.return(error);
            }
            else {
                future.return(result);
            }
        });
        return future.wait();
    },
    
    
    movieCreditsUpdate: function(movie_id, id, section) {
        var future = new Future();
        //var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');


        MovieDB.movieCredits({
            id: movie_id
        }, Meteor.bindEnvironment(function(error, result) {
            if (error) {
                throw(error);
            }
            else {
                
                Movies.update({
                    _id: id,
                    section: section,
                },
                {
                    $set: {
                        cast: result.cast,
                    }

                }, Meteor.bindEnvironment(function(err, res) {
                    if (err) {
                        console.log("ERROR ADDING movieCredits TO: " + id);
                        throw(err);
                    }
                    else {
                        future.return("SUCCESSFULLY ADDED movieCredits TO: " + id);
                        console.log("SUCCESSFULLY ADDED movieCredits TO: " + id);
                    }
                }));
                
                
            }
        }));
        return future.wait();
    },




    add_movies: function(name, old_name, overview, release, runtime, poster, poster_base) {
        Movies.insert({
            name: name,
            overview: overview,
            release: release,
            runtime: runtime,
            old_name: old_name,
            poster: poster_base + poster,
            date: new Date(),
            watched: false
        });

        return Movies.find().fetch();

    },
    
    
    updateMovieProgress: function(id, section, time) {
        //var future = new Future();

        Movies.update({_id: id , section: section},
        {
            $set: {
                progress: time,
                watched: true,
            }
        }
        )

        return true;

    },
    
    setWatchedMovie: function(id, section) {
        //var future = new Future();

        Movies.update({_id: id , section: section},
        {
            $set: {
                watched: true
            }
        }
        )

        return true;

    },



    updateMovie: function(id, section, name, overview, release, runtime, poster_base, poster, movie_id) {

        var future = new Future();

        Movies.update({
            _id: id,
            section: section
        }, {
            $set: {
                name: name,
                overview: overview,
                release: release,
                runtime: runtime,
                poster: poster_base + poster,
                movie_id: movie_id
            }

        }, function(err, res) {
            if (err) {
                future.return(err);
            }
            else {

                future.return("SUCCESSFULLY UPDATED: " + name);
            }
        });

        return future.wait();
    },



    addMovies: function(id, folder) {

        this.unblock();

        search_running = "yes"

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });

        var allVideos = [];
        var future = new Future(),
        walker;
        /*
        var walk = Meteor.npmRequire('walk'),
            fs = Meteor.npmRequire('fs'),
            mime = Meteor.npmRequire('mime'),
            walker,
            path = Meteor.npmRequire('path');
            */

        walker = walk2.walk(folder);

        walker.on("file", Meteor.bindEnvironment(function(root, fileStats, next) {


            /*
             
                    I'd like to have something to determine whether or not this folder has been entered, and if it has, use the biggest video file.
                    I have a problem right now with sample files. They are sometimes included in the folder with the movie, and right now, I have
                    it acting like that is it's own movie.
             
                    */

            fs.readFile(fileStats.name, Meteor.bindEnvironment(function() {

                var ext = path.extname(fileStats.name); // File extension
                var name1 = fileStats.name; // Filename
                var location = root + '/' + name1; // The full file location
                var nameEncoded = encodeURIComponent(name1); // URL friendly
                
                
                var video = Meteor.myFunctions.isVideoNotSample(name1, location); // Make sure the video isn't a sample

                if (video) { // If video is not a sample

                    notifications.emit('message', "Found a video. " + name1);
                    notifications.emit('message', root);
                    notifications.emit('message', name1);
                    notifications.emit('message', location);


                    var n = root.lastIndexOf('/');
                    var result1 = root.substring(n + 1);
                    root = result1;
                    notifications.emit('message', "root test");
                    notifications.emit('message', root);
                    //var type = mime.lookup(name1);
                    //var type1 = type.substring(0,type.indexOf("/"))
                    //notifications.emit('message', "mime");
                    //notifications.emit('message', type);
                    //notifications.emit('message', type1);

                    allVideos.push(location);
                    //if (type1 === "video") {
                    //if ( videoFormats.indexOf( ext ) > -1 ) {

                    Meteor.call('movieName', nameEncoded, root, function(error, result) { // Gues the name of the movie

                        if (error) {
                            console.log(error);
                            notifications.emit('message', error);
                            next();
                        }
                        else {






                            Movies.insert({
                                name: result,
                                location: [location],
                                section: id,
                                date: new Date(),
                                watched: false
                            });

                            //console.log(result);
                            notifications.emit('message', result);
                            notifications.emit('message', "Just finished guessing and adding: " + name1);
                            next();

                        }


                    });


                }
                else {
                    next();
                }

                //next();




            }));

        }));



        walker.on("errors", function(root, nodeStatsArray, next) {

            notifications.emit('message', "ERROR");
            notifications.emit('message', root);
            future.return("Error! " + next);

        });


        walker.on("end", Meteor.bindEnvironment(function() {



            var fetch = Movies.find({ // Find all movies for the section
                section: id
            }).fetch();

            notifications.emit('message', "allVideos");
            notifications.emit('message', fetch);

            fetch.map(function(file, index, array) { // This runs a map to go through every movie in the movie collection.

                run = run + 1; // This adds one to the current run count

                if (run >= 20) { // When the run count hits 20 or more

                    run = 0;
                    notifications.emit('message', 'YOU HIT THE LIMIT FOR TMDB');
                    Meteor._sleepForMs(30000); // Find the currect time to put it to sleep for
                    notifications.emit('message', 'THE LIMIT IS UP');
                    finished = finished + 1;

                    var name = file.name; // Getting the name of the movie

                    Meteor.call('searchMovie', name, function(error, movie) { // Do a search on TMDB for movies matching the name

                        if (error) {
                            notifications.emit('message', 'Error with ' + name);
                            notifications.emit('message', error);
                            future.return("Error searching for the movie " + '""' + name + '""' + "!");
                            console.log("Error searching for the movie " + '""' + name + '""' + "!");

                        }
                        else {

                            /* Use this to get more data for the movie later. It should get this data after movies already added.
                            var id = movie.results[0].id;
                            Meteor.call('movieInfo', id, function(error, movie) {
                                notifications.emit('message', movie);
                                
                            });
                            Meteor.call('movieCredits', id, function(error, movie) {
                                notifications.emit('message', movie);
                                
                            });
                            */
                            
                            notifications.emit('message', "File test");
                            notifications.emit('message', file.location[0]);
                            
                            var videoMetadata = Meteor.myFunctions.videoMetadata(file.location[0]);
                            
                            notifications.emit('message', "videoMetadata");
                            notifications.emit('message', videoMetadata);
                            
                            var duration = videoMetadata.format.duration;

                            notifications.emit('message', 'Found ' + name);

                            if (movie.results.length > 0) {


                                var it = movie.results[0]; // Traverse only in the first array returned. I'd like to eventually setup my own equation to see whether the search result is actually the correct movie, but I'm relying on the TMDB search currently.

                                notifications.emit('message', it);

                                // console.log(search._id);
                                var overview = it.overview;
                                var release = it.release_date;
                                var runtime = duration;
                                var poster_base = base_url;
                                var poster = it.poster_path;
                                var backdrop = "https://image.tmdb.org/t/p/original" + it.backdrop_path
                                var movie_id = it.id;
                                var title = it.original_title;

                                Movies.update({
                                    _id: file._id,
                                    section: id,
                                }, {

                                    $set: {
                                        name: title,
                                        overview: overview,
                                        release: release,
                                        runtime: runtime,
                                        //old_name: old_name,
                                        poster: poster_base + poster,
                                        backdrop: backdrop,
                                        movie_id: movie_id,
                                    }

                                }, function(err, res) {
                                    if (err) {
                                        console.log("single - ERROR UPDATING: " + title);
                                    }
                                    else {

                                        console.log("single - SUCCESSFULLY UPDATED: " + title + " id: " + file._id);
                                    }
                                });


                            }
                            else {
                                notifications.emit('message', 'There were no results searching for ' + name);


                                Movies.update({
                                    _id: file._id,
                                    section: id,
                                }, {
                                    $set: {
                                        no_results: true
                                    }

                                }, function(err, res) {
                                    if (err) {
                                        console.log("ERROR UPDATING: " + file.name);
                                    }
                                    else {

                                        console.log("SUCCESSFULLY UPDATED: " + file.name);
                                    }
                                });
                            }

                        }

                    });

                    /*
                
                            See if there is another way to do a search for movies where no information is found. 
                
                
                            */


                }
                else {

                    finished = finished + 1;

                    var name = file.name; // Getting the name of the movie

                    Meteor.call('searchMovie', name, function(error, movie) { // Do a search on TMDB for movies matching the name

                        if (error) {
                            notifications.emit('message', 'Error with ' + name);
                            notifications.emit('message', error);
                            future.return("Error searching for the movie " + '""' + name + '""' + "!");
                            console.log("Error searching for the movie " + '""' + name + '""' + "!");

                        }
                        else {

                            /* Use this to get more data for the movie later. It should get this data after movies already added.
                            var id = movie.results[0].id;
                            Meteor.call('movieInfo', id, function(error, movie) {
                                notifications.emit('message', movie);
                                
                            });
                            Meteor.call('movieCredits', id, function(error, movie) {
                                notifications.emit('message', movie);
                                
                            });
                            */
                            
                            notifications.emit('message', "File test");
                            notifications.emit('message', file.location[0]);
                            
                            var videoMetadata = Meteor.myFunctions.videoMetadata(file.location[0]);
                            
                            notifications.emit('message', "videoMetadata");
                            notifications.emit('message', videoMetadata);
                            
                            var duration = videoMetadata.format.duration;

                            notifications.emit('message', 'Found ' + name);

                            if (movie.results.length > 0) {


                                var it = movie.results[0]; // Traverse only in the first array returned. I'd like to eventually setup my own equation to see whether the search result is actually the correct movie, but I'm relying on the TMDB search currently.
                                
                                notifications.emit('message', it);
                                
                                /*
                                notifications.emit('message', 'it results');
                                notifications.emit('message', it);
                                */


                                // console.log(search._id);
                                var overview = it.overview;
                                var release = it.release_date;
                                var runtime = duration;
                                var poster_base = base_url;
                                var poster = it.poster_path;
                                var backdrop = "https://image.tmdb.org/t/p/original" + it.backdrop_path
                                var movie_id = it.id;
                                var title = it.original_title;

                                Movies.update({
                                    _id: file._id,
                                    section: id,
                                }, {

                                    $set: {
                                        name: title,
                                        overview: overview,
                                        release: release,
                                        runtime: runtime,
                                        //old_name: old_name,
                                        poster: poster_base + poster,
                                        backdrop: backdrop,
                                        movie_id: movie_id,
                                    }
                                }, function(err, res) {
                                    if (err) {
                                        console.log("single - ERROR UPDATING: " + title);
                                    }
                                    else {

                                        console.log("single - SUCCESSFULLY UPDATED: " + title + " id: " + file._id);
                                    }
                                });


                            }
                            else {
                                notifications.emit('message', 'There were no results searching for ' + name);


                                Movies.update({
                                    _id: file._id,
                                    section: id,
                                }, {
                                    $set: {
                                        no_results: true
                                    }

                                }, function(err, res) {
                                    if (err) {
                                        console.log("ERROR UPDATING: " + file.name);
                                    }
                                    else {

                                        console.log("SUCCESSFULLY UPDATED: " + file.name);
                                    }
                                });
                            }

                        }

                    });


                }

            });

            var pipeline = [{ // Get duplicate movies
                        $group: {
                            // Group by fields to match on (a,b)
                            _id: "$name",

                            // Count number of matching docs for the group
                            count: {
                                $sum: 1
                            },

                            // Save the _id for matching docs
                            docs: {

                                $push: {
                                    _id: "$_id",
                                    location: "$location"
                                }

                            }
                        }
                    },

                    // Limit results to duplicates (more than 1 match) 
                    {
                        $match: {
                            count: {
                                $gt: 1
                            }
                        }
                    }
                ]
                /*
                    
                var pipeline = [
                    {"$group" : { "_id": "$name", "count": { "$sum": 1 } } },
                    {"$match": {"_id" :{ "$ne" : null } , "count" : {"$gt": 1} } }, 
                    {"$project": {"name" : "$_id", "_id" : 0} }
                ];
                */


            /*

            var pipeline = [{
                "$group": {
                    "_id": "$name",
                    "count": {
                        "$sum": 1
                    }
                }
            }, {
                "$match": {
                    "_id": {
                        "$ne": null
                    },
                    "count": {
                        "$gt": 1
                    }
                }
            }, {
                "$project": {
                    "name": "$_id",
                    "_id": 0
                }
            }];
            */
            
            
            /*
            var result2 = Movies.aggregate(pipeline);

            notifications.emit('message', "pipeline");
            notifications.emit('message', result2);




            result2.map(function(file, index, array) {

                notifications.emit('message', "All ones");
                notifications.emit('message', file);

                var location_array = [];
                var updateId = file.docs[0]._id;
                var idArray = [];
                file.docs.shift();


                file.docs.map(function(file, index, array) {



                    location_array.push(file.location[0]);
                    idArray.push(file._id);
                    /*
                            
                            Movies.remove({
                                _id: file._id,
                                section: id,
                            },
                            function(err, res) {
                                if (err) {
                                    console.log("ERROR REMOVING: " + file.name);
                                }
                                else {
    
                                    console.log("SUCCESSFULLY REMOVED: " + file.name);
                                }
                            });
                            


                });

                notifications.emit('message', "All ids");
                notifications.emit('message', idArray);

                /*
                        Movies.remove({'_id':{'$in':idArray}},
                            function(err, res) {
                                if (err) {
                                    console.log("ERROR REMOVING docs ");
                                }
                                else {
    
                                    console.log("SUCCESSFULLY REMOVED docs ");
                                }
                            });
                         
                        */


                /*
                Movies.update({
                    _id: updateId,
                    section: id,
                },
                {
                    $push: {
                        location: {
                            $each: location_array
                        }
                    }

                }, function(err, res) {
                    if (err) {
                        console.log("ERROR UPDATING: " + file.name);
                    }
                    else {

                        console.log("SUCCESSFULLY UPDATED: " + file.name);
                    }
                });
                        
                

                notifications.emit('message', "All locations");
                notifications.emit('message', location_array);
                notifications.emit('message', updateId);



                /*
                var id_array = [];
                var location_array = [];

                notifications.emit('message', file.name);
                var fetch = Movies.find({
                    name: file.name,
                    section: id,
                }).fetch();
                        
                        

                fetch.map(function(file, index, array) {

                    id_array.push(file._id);
                    notifications.emit('message', "Just pushed new id");
                    location_array.push(file.location);
                    notifications.emit('message', "Just pushed new location");

                });

                var id1 = id_array.shift();

                Movies.update({
                    _id: id1,
                    section: id,
                }, {
                    $set: {
                        location: location_array
                    }

                }, function(err, res) {
                    if (err) {
                        console.log("ERROR UPDATING: " + file.name);
                    }
                    else {

                        console.log("SUCCESSFULLY UPDATED: " + file.name);
                    }
                });


                id_array.map(function(file, index, array) {

                    Movies.remove({
                        _id: file,
                        section: id,
                    }, function(err, res) {
                        if (err) {
                            console.log("ERROR REMOVING: " + file);
                        }
                        else {

                            console.log("SUCCESSFULLY REMOVING: " + file);
                        }
                    });
                });
                        
                


            });
            
            */
            
            var fetch2 = Movies.find({ // Find all movies for the section
                section: id
            }).fetch();
            
            fetch2.map(function(file, index, array) {
                
                
                run = run + 2; // This adds one to the current run count. This is to count the number of requests to TMDB to account for the timeout

                if (run >= 20) { // When the run count hits 20 or more

                    run = 0;
                    notifications.emit('message', 'YOU HIT THE LIMIT FOR TMDB');
                    Meteor._sleepForMs(30000); // Find the currect time to put it to sleep for
                    notifications.emit('message', 'THE LIMIT IS UP');
                    finished = finished + 1;
                    
                    
                    Meteor.myFunctions.movieImages(file.movie_id, file.name, file._id, file.section); // Get the movie posters and backdrops
                
                    Meteor.call('movieCredits', file.movie_id, function(error, movie) { // Get the cast
    
                            if (error) {
                                notifications.emit('message', 'Error adding credits to: ' + file.name);
                                notifications.emit('message', error);
    
                            }
                            else {
                    
                    
                                notifications.emit('message', 'Credits for ' + file.name);
                                notifications.emit('message', movie);
                                
                                
                                Movies.update({
                                    _id: file._id,
                                    section: id,
                                },
                                {
                                    $set: {
                                        cast: movie.cast,
                                    }
                
                                }, function(err, res) {
                                    if (err) {
                                        notifications.emit('message', "There was an error getting the credits for: " + file.name);
                                        notifications.emit('message', err);
                                    }
                                    else {
                
                                        notifications.emit('message', "Added the credits for: " + file.name);
                                    }
                                });
                                
                            }
                            
                    });
                    
                    
                } else {
                    
                    notifications.emit('message', 'movieImages test: ' + file.name);
                    notifications.emit('message', file);
                    Meteor.myFunctions.movieImages(file.movie_id, file.name, file._id, file.section); // Get the movie posters and backdrops
                
                    Meteor.call('movieCredits', file.movie_id, function(error, movie) { // Get the cast
    
                            if (error) {
                                notifications.emit('message', 'Error adding credits to: ' + file.name);
                                notifications.emit('message', error);
    
                            }
                            else {
                    
                    
                                notifications.emit('message', 'Credits for ' + file.name);
                                notifications.emit('message', movie);
                                
                                
                                Movies.update({
                                    _id: file._id,
                                    section: id,
                                },
                                {
                                    $set: {
                                        cast: movie.cast,
                                    }
                
                                }, function(err, res) {
                                    if (err) {
                                        notifications.emit('message', "There was an error getting the credits for: " + file.name);
                                        notifications.emit('message', err);
                                    }
                                    else {
                
                                        notifications.emit('message', "Added the credits for: " + file.name);
                                    }
                                });
                                
                            }
                            
                    });
                    
                    
                    
                }
                
                
            });
            
            
            


            future.return("Finished!");



        }));


        return future.wait();
    },




    /*
            
                        guessIt3: function(id, folder) {

                this.unblock();

                notifications.permissions.read(function(userId, eventName) {
                    return true;
                });
                
                var allVideos = [];
                var addedMovies = [];
                var future = new Future();
                var walk = Meteor.npmRequire('walk'),
                    fs = Meteor.npmRequire('fs'),
                    mime = Meteor.npmRequire('mime'),
                    walker,
                    path = Meteor.npmRequire('path');
                
                walker = walk.walk(folder);
                
                walker.on("file", Meteor.bindEnvironment(function(root, fileStats, next) {
                    


                    fs.readFile(fileStats.name, Meteor.bindEnvironment(function() {
                        
                        var ext = path.extname(fileStats.name);
                        var name1 = fileStats.name;
                        var location = root + '/' + name1;
                        var nameEncoded = encodeURIComponent(name1);
                        
                        var videoFormats = [".avi",".mkv",".mp4",".vob",".ts",".m2ts",".mpg",".wmv"];
                        
                        if ( videoFormats.indexOf( ext ) > -1 ) {
                            
                            notifications.emit('message', "Found a video. " + name1);
                            notifications.emit('message', root);
                            notifications.emit('message', name1);
                            notifications.emit('message', location);
                            
                            
                            var n = root.lastIndexOf('/');
                        var result1 = root.substring(n + 1);
                        root = result1;
                        notifications.emit('message', "root test");
                        notifications.emit('message', root);
                            //var type = mime.lookup(name1);
                            //var type1 = type.substring(0,type.indexOf("/"))
                            //notifications.emit('message', "mime");
                            //notifications.emit('message', type);
                            //notifications.emit('message', type1);
                            
                            allVideos.push(location);
                            //if (type1 === "video") {
                            //if ( videoFormats.indexOf( ext ) > -1 ) {

                            Meteor.call('movieName', nameEncoded, root, function(error, result) {

                                if (error) {
                                    console.log(error);
                                    notifications.emit('message', error);
                                    next();
                                }
                                else {
                                    
                                    name = result;
                                        
                                    var addMovie = Movies.insert({
                                        name: result,
                                        location: [location],
                                        section: id,
                                    });
                                    
                                    addedMovies.push(addMovie);

                                    //console.log(result);
                                    notifications.emit('message', result);
                                    notifications.emit('message', "Just finished guessing and adding: " + name1);
                                    next();

                                }


                            });
                            
                            
                            } else {
                                next();
                            }
                            
                            //next();


                        
                        
                    }));
                
                }));



                walker.on("errors", Meteor.bindEnvironment(function(root, nodeStatsArray, next) {
                    
                    notifications.emit('message', "ERROR");
                    notifications.emit('message', root);
                    future.return("Error! " + next);

                }));


                walker.on("end", Meteor.bindEnvironment(function() {

                    addedMovies.map(function(file, index, array) {
                        
                        notifications.emit('message', 'addedMovies');
                        notifications.emit('message', addedMovies);
                        notifications.emit('message', name);
                        
                        
                            Meteor.call('searchMovie', name, function(error, movie) { // Do a search on TMDB for movies matching the name

                                if (error) {
                                    notifications.emit('message', 'Error with ' + name);
                                    notifications.emit('message', error);
                                    future.return("Error searching for the movie " + '""' + name + '""' + "!");
                                    console.log("Error searching for the movie " + '""' + name + '""' + "!");

                                }
                                else {

                                    notifications.emit('message', 'Found ' + name);

                                    if (movie.results.length > 0) {


                                        var it = movie.results[0]; // Traverse only in the first array returned. I'd like to eventually setup my own equation to see whether the search result is actually the correct movie, but I'm relying on the TMDB search currently.



                                        // console.log(search._id);
                                        var overview = it.overview;
                                        var release = it.release_date;
                                        var runtime = it.runtime;
                                        var poster_base = base_url;
                                        var poster = it.poster_path;
                                        var movie_id = it.id;
                                        var title = it.original_title;

                                        Movies.update({
                                            _id: file,
                                        }, {
                                            
                                            $set: {
                                                name: title,
                                                overview: overview,
                                                release: release,
                                                runtime: runtime,
                                                old_name: old_name,
                                                poster: poster_base + poster,
                                                movie_id: movie_id,
                                            }
                                            
                                        }, function(err, res) {
                                            if (err) {
                                                console.log("single - ERROR UPDATING: " + title);
                                            }
                                            else {

                                                console.log("single - SUCCESSFULLY UPDATED: " + title + " id: " + file);
                                            }
                                        });


                                    }
                                    else {
                                        notifications.emit('message', 'There were no results searching for ' + name);


                                        Movies.update({
                                            _id: file
                                        }, {
                                            $set: {
                                                hide: 'yes'
                                            }

                                        }, function(err, res) {
                                            if (err) {
                                                console.log("ERROR UPDATING: " + name);
                                            }
                                            else {

                                                console.log("SUCCESSFULLY UPDATED: " + name);
                                            }
                                        });
                                    }

                                }

                            });
                    
                    
                });



                    future.return("Finished!");
                    
                    

                }));


                return future.wait();
            },


*/

    movieName: function(name, root) {

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });

        var future = new Future();
        var call = Meteor.http.call('GET', "http://localhost:5000/?filename=" + name + "&options=--type%3Dmovie%20", {});
        notifications.emit('message', "RUNNING " + name);

        //console.log("No data for the year. Checking the screen size.");
        if (!call.data.screen_size) {
            notifications.emit('message', "NO SIZE " + name);
            notifications.emit('message', "TRYING " + root + " INSTEAD OF " + name);
            notifications.emit('message', call);
            root = encodeURIComponent(root);
            //console.log("No data for the screen size. Going to run search for folder name instead.")
            var call2 = Meteor.http.call('GET', "http://localhost:5000/?filename=" + root + "&options=--type%3Dmovie%20", {});

            if (!call2.data.screen_size) {

                future.return(call.data.title);

            }
            else {

                future.return(call2.data.title);
            }


        }
        else {
            future.return(call.data.title);
        }


        /*
    
                If the filename doesn't include a year or quality, check the folder name. If it also doesn't include a year or quality, go with the
                filename guess.
    
                */



        return future.wait();

    },
    
    
    updateMoviePoster: function(id, src, section) {
        
        var future = new Future();
        
        Movies.update({
            _id: id,
            section: section
        }, {
            $set: {
                poster: src
            }

        }, function(err, res) {
            if (err) {
                future.return(err);
            }
            else {

                future.return("SUCCESSFULLY UPDATED: " + id);
            }
        });
        
        return future.wait();

    },
    
    
        updateMovieBackdrop: function(id, src, section) {
        
        var future = new Future();
        
        Movies.update({
            _id: id,
            section: section
        }, {
            $set: {
                backdrop: src
            }

        }, function(err, res) {
            if (err) {
                future.return(err);
            }
            else {

                future.return("SUCCESSFULLY UPDATED BACKDROP: " + id);
            }
        });
        
        return future.wait();

    },
    
    
    
    searchMovieCast: function(id, section, movie_id) {
        
        var future = new Future();
    
    Meteor.call('movieCredits', movie_id, function(error, movie) { // Do a search on TMDB for movies matching the name

                        if (error) {
                            notifications.emit('message', 'Error with getting the credits.');
                            notifications.emit('message', error);
                            throw(error);
                            future.return(error);

                        }
                        else {
                            
                            
                            Movies.update({
                                _id: id,
                                section: section,
                            },
                            {
                                $set: {
                                    cast: movie.cast,
                                }
            
                            }, function(err, res) {
                                if (err) {
                                    notifications.emit('message', "ERROR ADDING movieCredits TO: " + id);
                                    notifications.emit('message', err);
                                    throw(err);
                                    future.return(err);
                                }
                                else {
            
                                    console.log("SUCCESSFULLY ADDED movieCredits TO: " + id);
                                    future.return({res, movie});
                                }
                            });
                            
                            
                            
                            
                            
                            
                            
                            
                
                
                        }
                        
                        
                        
                });
    
    return future.wait();
    
    },

    removeMovies: function(section) {

        return Movies.remove({
            section: section
        });

    },





});