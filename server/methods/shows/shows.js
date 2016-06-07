import Future from 'fibers/future';

import MovieDB1 from 'moviedb';
var MovieDB = new MovieDB1('23290308516dcbfcb67fb0f330028492');

import walk from 'walkdir';
import fs from 'fs';
import mime from 'mime';
import path from 'path';


import TVDB from 'node-tvdb/compat';
var tvdb = new TVDB('79403F2E528405DB');


//var Future = Meteor.npmRequire('fibers/future');

Meteor.methods({
    
    updateShow: function(id, section, series_name, overview, banner, backdrop, language, show_id, poster, episodes) {

        Tv.update({
                _id: id,
                section: section
            },
            {
                $set: {
                    name: series_name,
                    overview: overview,
                    banner: banner,
                    backdrop: backdrop,
                    language: language,
                    show_id: show_id,
                    series_id: show_id,
                    poster: poster,
                    episode_info: episodes,
                }

            },
            function(err, res) {
                if (err) {
                    throw err;
                }
                else {
                    return "Updated the show.";
                }
            });

    },
    
    
    
    updateShowDescription: function(id, section, description) {

        Tv.update({
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
    
    
   refreshShow: function(id, section, overview) {
            
           return Tv.update({
               _id: id,
               section: section
           },
           {
               $set: {
                   overview: overview
               }
           }
           )
            
            


    },
    
    
    countShows: function(section) {
            
           var count = Tv.find({
                section: section
            });
            
            //console.log(count.count());
            return count.count();
            
            


    },
    
    
    updateShowProgress: function(id, section, time, season, episode) {
        //var future = new Future();
        /*
        var name = req.params.name;
var value = req.params.value;
var query = {};
query[name] = value;
collection.findOne(query, function (err, item) { ... });
*/

/*
Collection.update(
    { _id: "wLXDvjDvbsxzfxabR", "group.id": "dfDFSfdsFDSfdsFws"}, 
    {$set: { "group.data": newData }}
);

*/

console.log("id " + id);
console.log("section " + section);
console.log("time " + time);
console.log("season " + season);
console.log("episode " + episode);



/*
var show = Tv.update(
  {_id: id,
   'episodes.season_number': season,
   'episodes.episode': episode
  }, 
  {$set: {'episodes.$.watched': true}}
)



var show = Tv.update({
         _id: id,
         episodes: {
             $elemMatch: {
                 season_number: season,
                 episode: episode
             }
         },
         {
             $set: {
                 'episodes.$': {
                     watched: true
                 }
             }
         })









*/

/*
var show = Tv.findOne(
  {_id: id,
   'episodes.season_number': season,
   'episodes.episode': episode
  }
)

*/


var show = Tv.update({
         _id: id,
         episodes: {
             $elemMatch: {
                 season_number: season,
                 episode: episode
             }
         }},
         {
             $set: {
                 'episodes.$.progress': time,
                 'episodes.$.watched': true,
                 }
             }
         )


        
        console.log("show")
        console.log(show)
        
        /*
        a = [{prop1:"abc",prop2:"qwe"},{prop1:"bnmb",prop2:"yutu"},{prop1:"zxvz",prop2:"qwrq"}]
index = a.findIndex(x => x.prop2=="yutu")
*/


/*
        var index1;
        
        show.map(function(file, index, array) {

            if (file.episode === episode) {

                file.progress === time;
                
                index1 === index;

            }

        });
        
        console.log(index1)
        */
        
        /*

        Tv.update({_id: id , section: section},
        {
            $set: {
                progress: time
            }
        }
        )
        
        */

        return true;

    },


    searchShow: function(name) {
        var future = new Future();
        //var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

        MovieDB.searchTv({
            query: name
        }, function(error, result) {

            if (error) {

                future.return(error);

            }
            else {

                if (result.results && result.results.length > 0) {

                    var movie = result;

                    notifications.emit('message', result);

                    MovieDB.tvInfo({
                        id: result.results[0].id
                    }, function(err, res) {

                        if (err) {

                            future.return(error);

                        }
                        else {

                            if (res.status == "Returning Series") {

                                notifications.emit('message', name + " is a returning series.");

                                MovieDB.tvSeasonInfo({
                                    id: res.id,
                                    season_number: res.number_of_seasons
                                }, function(err, res) {

                                    if (err) {

                                        future.return(error);

                                    }
                                    else {

                                        future.return(res);

                                    }

                                });




                            }
                            else {
                                future.return(res);
                            }

                        }
                    });










                }
                else {
                    future.return("Looks like I couldn't find any info for the show on TVDB.");
                    throw "Looks like I couldn't find any info for the show on TVDB.";
                }
            }

        });

        return future.wait();





    },




    showInfo: function(id, season) {
        var future = new Future();
        //var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

        MovieDB.tvSeasonInfo({
            id: id,
            season_number: season
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




    showName4: function(folder, name, nameOg) {
        //var walk = Meteor.npmRequire('walkdir');
        //var path = Meteor.npmRequire('path');
        var future = new Future();

        /*
        var future2 = new Future();
        var call = Meteor.http.call("GET", "http://localhost:5000/?filename=" + name + "&options=--type%3Depisode%20", {},
          function (error, result) {
            if (error) {
              notifications.emit('message', "There was an error trying to guess the name - Maybe the GuessIt server isn't up? ");
              notifications.emit('message', error);
              //future.return("There was an error trying to guess the name - Maybe the GuessIt server isn't up? " + error);
            } else {
                //notifications.emit('message', result);
                future2.return(result);
                //return result;
                return future2.wait();
            }
          });
          future2.wait();
          notifications.emit('message', call);
        */


        try {
            var call = Meteor.http.call('GET', "http://localhost:5000/?filename=" + name + "&options=--type%3Depisode%20", {});
        }
        catch (e) {
            notifications.emit('message', "There was an error trying to guess the name - Maybe the GuessIt server isn't up? ");
            notifications.emit('message', e);
            future.return("There was an error trying to guess the name - Maybe the GuessIt server isn't up? ");
        }




        //var call = Meteor.http.call('GET', "http://localhost:5000/?filename=" + name + "&options=--type%3Depisode%20", {});
        var info_array = [];

        if (call.data.episode && !call.data.title && !call.data.season) {

            notifications.emit('message', name + " has an episode, doesn't have a title, and doesn't have a season");
            Meteor.call('showNameEncode', call.data.episode, function(error, result) {

                if (error) {

                    notifications.emit('message', "There was an error trying to guess the name - Maybe the GuessIt server isn't up? " + error);
                    future.return("There was an error trying to guess the name - Maybe the GuessIt server isn't up? " + error);

                }
                else {

                    future.return(result);


                }

            });



        }
        else if (call.data.title && !call.data.episode && !call.data.season && !call.data.episode_title) {
            future.return(call.data);
        }
        else if (!call) {
            notifications.emit('message', "There was an error trying to guess the name - Maybe the GuessIt server isn't up? ");
            notifications.emit('message', call);
            future.return("There was an error trying to guess the name - Maybe the GuessIt server isn't up? ");
        }
        else {
            future.return(call.data);
        }





        // Please do alot better if checdks below. They're not right an primarily here as a filler. For instance, if there's not season/episode
        // data found on the filename, look at the parent folder to see if it's named with a season or episode number. If not, check to see
        // if the structure is something like the folder named "Season 1", "1", "01", etc. Then take that as a season number, and if the
        // files are then labeled with, for instance, just numbers, take that as the episode number.




        /*
    
                If the filename doesn't include a year or quality, check the folder name. If it also doesn't include a year or quality, go with the
                filename guess.
    
                */



        return future.wait();

    },

    episodeName: function(episode) {
        var future = new Future();
        episode = encodeURIComponent(episode);
        var call = Meteor.http.call('GET', "http://localhost:5000/?filename=" + episode + "&options=--type%3Depisode%20", {});
        var info_array = [];

        // Please do alot better if checdks below. They're not right an primarily here as a filler. For instance, if there's not season/episode
        // data found on the filename, look at the parent folder to see if it's named with a season or episode number. If not, check to see
        // if the structure is something like the folder named "Season 1", "1", "01", etc. Then take that as a season number, and if the
        // files are then labeled with, for instance, just numbers, take that as the episode number.

        future.return(call.data);


        /*
    
                If the filename doesn't include a year or quality, check the folder name. If it also doesn't include a year or quality, go with the
                filename guess.
    
                */



        return future.wait();

    },





    addShows: function(section, location) {

        this.unblock();

        var sectionId = section;


        notifications.permissions.read(function(userId, eventName) {
            return true;
        });

        var future = new Future();
        var directories = [];

        var emitter = walk(location, { // Make this an option, rather than hardcoded,
            "no_recurse": true
        });

        emitter.on('error', function(path, error) {
            error.should.exist;
        });

        emitter.on('directory', Meteor.bindEnvironment(function(dir, stat) {
            //notifications.emit('message', dir);
            //toastr.success("Found a directory: ", dir);
            directories.push(dir);
        }));

        emitter.on('end', Meteor.bindEnvironment(function(path1, stat) {
            notifications.emit('message', "All Directories");
            notifications.emit('message', directories);

            directories.map(Meteor.bindEnvironment(function(folder, index, array) {

                // Guess the show name
                notifications.emit('message', "Going to find the show name for " + folder);
                var showNameWrap = Meteor.myFunctions.showName(folder); 

                //console.log(showNameWrap)
                //var showNameResponse = showNameWrap();
                //

                // Search for the show
                notifications.emit('message', "Going to do a search for the show. " + folder);
                var showSearch = Meteor.myFunctions.showSearch(showNameWrap, showNameWrap.title, folder, sectionId);

                notifications.emit('message', showSearch);

                if (showSearch.series) { // If I get a series response in the search

                    var seasons = showSearch.seasons;
                    notifications.emit('message', "showSearch test");
                    notifications.emit('message', showSearch);
                    var episodes = showSearch.episodes;
                    var series = showSearch.series;

                    // Look inside the show folder
                    notifications.emit('message', "Going to recursively look through the directory for episodes in " + folder);
                    var directoryRecur = Meteor.myFunctions.directoryRecur(folder, series, seasons, sectionId, episodes);
                    notifications.emit('message', directoryRecur);
                    //
                }
            }));

            var looseFolders = Meteor.myFunctions.looseFoldersFunction(sectionId);

            notifications.emit('message', "Finished looseFolders");
            notifications.emit('message', looseFolders);


            var allShows = Tv.find({ // Get all of the shows in the database.
                section: sectionId
            }).fetch();

            notifications.emit('message', "I finished adding all your shows. I'm now going to pickup some extra metadata in the background for episodes, etc. Here's all the shows you have in your database:");
            notifications.emit('message', allShows);


            allShows.map(function(show, index, array) {

                var _id = show._id;
                var id = show.show_id;
                var name = show.name;
                var episode_info = show.episode_info; // This is the complete metadata for every episode available on TMDB
                var episodes = show.episodes;
                notifications.emit('message', "All show info for " + name + " :");
                notifications.emit('message', show);
                notifications.emit('message', "episodes");
                notifications.emit('message', episodes);


                show.seasons.map(function(file, index, array) {

                    var season = file.season_number;
                    var season_posters = [];
                    var episodeInfo = [];

                    notifications.emit('message', "Getting season data for " + name + " season " + season);
                    notifications.emit('message', episode_info);


                    // Get the season object
                    // Likely a better way to do this. Maybe pull all objects with a season number matching the current season in the function above. Then search thtat array for episodes.
                    episodeInfo = episode_info.filter(function(obj) {
                        return obj.SeasonNumber == season;
                    });


                    notifications.emit('message', "All season info for " + name + " season " + season);
                    notifications.emit('message', episodeInfo);




                    Meteor.call('getBanners', id, function(error, result) {

                        if (error) {
                            notifications.emit('message', error);
                        }
                        else {

                            //notifications.emit('message', "Found banners for: " + show);
                            //notifications.emit('message', response);
                            var banners = result;
                            //notifications.emit('message', result);
                            //notifications.emit('message', 1);
                            //console.log(1);

                            if (banners) {

                                banners.map(function(file, index, array) {

                                    if (file.Season == season) {
                                        season_posters.push("http://thetvdb.com/banners/" + file.BannerPath)
                                            //notifications.emit('message', file);







                                    }

                                });




                                var episodeArray = [];

                                if (episodes.length > 0) {

                                    episodes.map(function(file, index, array) {

                                        if (file.episode && file.season_number === season) {

                                            var episode = file.episode;

                                            notifications.emit('message', "Checking " + name + " season " + season + " episode " + episode);

                                            /*
                                            var episodeIndex = episodeInfo.filter(function(obj) {
                                                return obj.EpisodeNumber == episode;
                                            }).map(function(obj) {
                                                return {

                                                    episode: episode,
                                                    location: file.location,
                                                    name: obj.EpisodeName,
                                                    banner: "http://thetvdb.com/banners/" + obj.filename,
                                                    date: new Date()

                                                }
                                            });
                                            */
                                            
                                            var episodeIndex = episodeInfo.filter(function(obj) {
                                                return obj.EpisodeNumber == episode;
                                            })[0];


                                            if (episodeIndex) {
                                                
                                                notifications.emit('message', "episodeIndex");
                                                notifications.emit('message', episodeIndex);
                                                file.banner = "http://thetvdb.com/banners/" + episodeIndex.filename;


                                                //episodeArray.push(episodeIndex[0]);

                                            }

                                        }

                                    });

                                }


                                var tv_update3 = Tv.update({
                                        _id: _id,
                                        'seasons.season_number': season,
                                        section: sectionId,
                                    }, {
                                        $set: {
                                            date_updated: new Date(),
                                            "seasons.$.poster": season_posters[0],
                                            "seasons.$.posters": season_posters,
                                            "episodes": episodes,

                                        }
                                    }, {
                                        multi: true
                                    }

                                );

                                if (tv_update3) {

                                    notifications.emit('message', "Just updated " + name + " season " + season);

                                }
                                else {

                                    notifications.emit('message', "Wasn't able to update " + name + " season " + season);

                                }




                            }

                        }


                    });

                });


            })


            notifications.emit('message', "done");




        }))

        return future.wait();






    },




    getActorsTv: function(id) {

        var future = new Future();
        /*
        var TVDB = Meteor.npmRequire("node-tvdb/compat");
        var tvdb = new TVDB("79403F2E528405DB");
        */


        tvdb.getActors(id, function(error, response) {

            if (error) {
                future.return(error);
            }
            else {
                future.return(response);
            }

        });

        return future.wait();

    },


    getBanners: function(id) {

        var future = new Future();
        /*
        var TVDB = Meteor.npmRequire("node-tvdb/compat");
        var tvdb = new TVDB("79403F2E528405DB");
        */

        tvdb.getBanners(id, function(error, response) {


            if (error) {
                future.return(error);
            }
            else {
                future.return(response);
            }


        });


        return future.wait();
    },



    getSeries: function(id) {

        var future = new Future();
        /*
        var TVDB = Meteor.npmRequire("node-tvdb/compat");
        var tvdb = new TVDB("79403F2E528405DB");
        */

        tvdb.getSeriesAllById(id, function(error, response) {


            if (error) {
                future.return(error);
            }
            else {
                future.return(response);
            }




        });


        return future.wait()
    },





    searchShow3: function(name) {

        //this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });


        var future = new Future();
        /*
        var TVDB = Meteor.npmRequire("node-tvdb/compat");
        var tvdb = new TVDB("79403F2E528405DB");
        */

        tvdb.getSeriesByName(name, function(err, response) {

            if (err) {

                future.return(err);

            }
            else {
                notifications.emit('message', response);

                if (response && response[0]) {

                    var it = response[0];


                    tvdb.getSeriesAllById(it.seriesid, function(error, response2) {

                        if (err) {

                            future.return(err);

                        }
                        else {
                            notifications.emit('message', response2);
                            future.return(response2);

                        }




                    });

                }
                else {
                    future.return("No results for " + name);
                }




            }

        });



        return future.wait();

    },

    searchShow4: function(name) {

        //this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });


        var future = new Future();
        /*
        var TVDB = Meteor.npmRequire("node-tvdb/compat");
        var tvdb = new TVDB("79403F2E528405DB");
        */

        tvdb.getSeriesByName(name, function(err, response) {

            if (err) {

                future.return(err);

            }
            else {
                notifications.emit('message', response);

                if (response && response[0]) {

                    var it = response;
                    future.return(it);

                }
                else {
                    future.return("No results for in the TVDB for " + name)
                }



            }

        });



        return future.wait();

    },




    searchShow5: function(id) {

        //this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });


        var future = new Future();
        /*
        var TVDB = Meteor.npmRequire("node-tvdb/compat");
        var tvdb = new TVDB("79403F2E528405DB");
        */



        tvdb.getSeriesAllById(id, function(error, response) {

            if (error) {

                future.return(error);

            }
            else {
                //notifications.emit('message', response);
                future.return(response);

            }

        });



        return future.wait();

    },


    showName: function(name) {
        var future = new Future();
        var call = Meteor.http.call('GET', "http://localhost:5000/?filename=" + name + "&options=--type%3Depisode%20", {});

        future.return(call.data);

        return future.wait();

    },



    showNameEncode: function(name) {
        var future = new Future();
        name = encodeURIComponent(name);
        var call = Meteor.http.call('GET', "http://localhost:5000/?filename=" + name + "&options=--type%3Depisode%20--expected-title%3D" + name, {});

        future.return(call.data);

        return future.wait();

    },
    
    
    
    removeShow: function(id, section) {

        return Tv.remove({
            _id: id,
            section: section
        });

    },



    removeShows: function(section) {

        return Tv.remove({
            section: section
        });

    },
    
    removeAllShows: function() {

        return Tv.remove({});

    },




    /*

    rescanShows: function() {

        this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });


        var future = Meteor.npmRequire('fibers/future');
        var TVDB = Meteor.npmRequire("node-tvdb/compat");
        var tvdb = new TVDB("79403F2E528405DB");

        var poster_base = base_url;



        var fetch = Tv.find().fetch();

        run = 0;
        fetch.map(function(file, index, array) { // This runs a map to go through every movie in the movie collection.

            run = run + 1;

            if (run >= 20) {
                run = 0;
                notifications.emit('message', 'YOU HIT THE LIMIT FOR TVDB');
                Meteor._sleepForMs(18000);
                notifications.emit('message', 'THE LIMIT IS UP');


                name = file.name;
                Meteor.call('searchShow', name, function(error, result) {
                    if (error) {
                        notifications.emit('message', error);
                    }
                    else {




                        if (result && result.results && result.results.length > 0) {


                            var it = result.results[0];

                            notifications.emit('message', 'Found the info for ' + file.name);
                            notifications.emit('message', it);




                            //var search = Tv.findOne({name: name});

                            var poster_base = base_url;


                            // console.log(search._id);
                            var overview = it.overview;
                            var series_name = it.name;
                            var show_id = it.id;
                            var language = it.original_language;
                            var country = it.origin_country[0];
                            var poster = poster_base + it.poster_path;
                            var backdrop = poster_base + it.backdrop_path;
                            //notifications.emit('message', file._id);
                            var new_id = file._id;



                            Tv.update({
                                    _id: new_id
                                },

                                {
                                    $set: {
                                        name: series_name,
                                        overview: overview,
                                        language: language,
                                        poster: poster,
                                        show_id: show_id

                                    }
                                });





                        }
                        else {

                            notifications.emit('message', "Couldn't find a result for " + name);

                        }

                    }
                });



            }
            else {

                finished = finished + 1;
                name = file.name;
                //console.log(name);




                Meteor.call('searchShow', name, function(error, result) {
                    if (error) {
                        notifications.emit('message', error);
                    }
                    else {




                        if (result && result.results && result.results.length > 0) {


                            var it = result.results[0];

                            notifications.emit('message', 'Found the info for ' + file.name);
                            notifications.emit('message', it);




                            //var search = Tv.findOne({name: name});

                            var poster_base = base_url;


                            // console.log(search._id);
                            var overview = it.overview;
                            var series_name = it.name;
                            var show_id = it.id;
                            var language = it.original_language;
                            var country = it.origin_country[0];
                            var poster = poster_base + it.poster_path;
                            var backdrop = poster_base + it.backdrop_path;
                            //notifications.emit('message', file._id);
                            var new_id = file._id;



                            Tv.update({
                                    _id: new_id
                                },

                                {
                                    $set: {
                                        name: series_name,
                                        overview: overview,
                                        language: language,
                                        poster: poster,
                                        show_id: show_id

                                    }
                                });





                        }
                        else {

                            notifications.emit('message', "Couldn't find a result for " + name);

                        }

                    }
                });

            }

        });


        fetch = Tv.find().fetch();


        run = 0;
        fetch.map(function(file, index, array) {



            name = file.name;

            var id = file.show_id;

            var new_id = file._id;

            if (run >= 20) {

                run = 0;
                notifications.emit('message', 'YOU HIT THE LIMIT FOR TVDB');
                Meteor._sleepForMs(18000);
                notifications.emit('message', 'THE LIMIT IS UP');

                file.seasons.map(function(file, index, array) {

                    run = run + 1;

                    if (run >= 20) {
                        run = 0;
                        notifications.emit('message', 'YOU HIT THE LIMIT FOR TVDB');
                        Meteor._sleepForMs(18000);
                        notifications.emit('message', 'THE LIMIT IS UP');

                        var season = file.season_number;

                        Meteor.call('showInfo', id, season, function(error, result) {
                            if (error) {
                                notifications.emit('message', error);
                            }
                            else {

                                notifications.emit('message', result);


                                var poster = poster_base + result.poster_path;

                                var tv_update = Tv.update({
                                    _id: new_id,
                                    'seasons.season_number': season
                                }, {
                                    $set: {
                                        "seasons.$.poster": poster
                                    }
                                });




                            }

                        });

                    }
                    else {

                        var season = file.season_number;

                        Meteor.call('showInfo', id, season, function(error, result) {
                            if (error) {
                                notifications.emit('message', error);
                            }
                            else {

                                notifications.emit('message', result);

                                var poster = poster_base + result.poster_path;

                                var tv_update = Tv.update({
                                    _id: new_id,
                                    'seasons.season_number': season
                                }, {
                                    $set: {
                                        "seasons.$.poster": poster
                                    }
                                });




                            }

                        });

                    }
                });
            }
            else {

                file.seasons.map(function(file, index, array) {

                    run = run + 1;

                    if (run >= 20) {
                        run = 0;
                        notifications.emit('message', 'YOU HIT THE LIMIT FOR TVDB');
                        Meteor._sleepForMs(18000);
                        notifications.emit('message', 'THE LIMIT IS UP');

                        var season = file.season_number;

                        Meteor.call('showInfo', id, season, function(error, result) {
                            if (error) {
                                notifications.emit('message', error);
                            }
                            else {

                                notifications.emit('message', result);


                                var poster = poster_base + result.poster_path;

                                var tv_update = Tv.update({
                                    _id: new_id,
                                    'seasons.season_number': season
                                }, {
                                    $set: {
                                        "seasons.$.poster": poster
                                    }
                                });




                            }

                        });

                    }
                    else {

                        var season = file.season_number;

                        Meteor.call('showInfo', id, season, function(error, result) {
                            if (error) {
                                notifications.emit('message', error);
                            }
                            else {

                                notifications.emit('message', result);

                                var poster = poster_base + result.poster_path;

                                var tv_update = Tv.update({
                                    _id: new_id,
                                    'seasons.season_number': season
                                }, {
                                    $set: {
                                        "seasons.$.poster": poster
                                    }
                                });




                            }

                        });

                    }
                });

            }




        });




        search_running = "";


        return ("Finished!");

    },
            
    */




});