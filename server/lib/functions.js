var videoFormats = [".avi", ".mkv", ".mp4", ".vob", ".ts", ".m2ts", ".mpg", ".wmv"];
var Future = Meteor.npmRequire('fibers/future');
var path = Meteor.npmRequire('path');
var current_seasons = [];
var looseFolders = [];
var looseEpisodes = [];

Meteor.myFunctions = {

    showName: function(file) {


        var future = new Future();
        var folder = file;
        var name = path.basename(file)
        var nameOg = name;
        name = encodeURIComponent(name);


        Meteor.call('showName4', folder, name, nameOg, Meteor.bindEnvironment(function(error, result) {

            if (error) {

                notifications.emit('message', error);

            }
            else {

                notifications.emit('message', result);

                /*
                setTimeout(function() {
                  callback(null, result);
                }, 10000);
                */

                //callback(null, result);
                future.return(result)

            }


        }))

        return future.wait();

    },


    // Run a search for the show with the extracted guess

    showSearch: function(showNameResponse, name, location, sectionId) {

        var future = new Future();
        var walk = Meteor.npmRequire('walkdir');
        var countrynames = Meteor.npmRequire('countrynames');
        notifications.emit('message', "Running a show search on " + name + " " + location);
        if (showNameResponse.title && showNameResponse.season && showNameResponse.episode) { // If all of these, I will assume it's an episode folder, and will do somethig with it later.
            looseFolders.push({
                name: name,
                season: showNameResponse.season,
                episode: showNameResponse.episode,
                location: location
            });
            future.return("Just pushed " + name + " season " + showNameResponse.season + " episode " + showNameResponse.episode + " to the 'looseFolders' array because I found an episode folder in the root.");
        }

        else if (!showNameResponse.episode) { // If there was no episode extracted

            if (!showNameResponse.season) { // If there was no season extracted either, I'll assume it's a show folder


                notifications.emit('message', "Found a show: " + name + " ");

                // If it includes a country, make sure to include it in the search

                if (showNameResponse.country) {

                    var country = showNameResponse.country;

                    var country2 = countrynames.getCode(country)

                    name = name + " " + country2;

                }

                //

                // If it includes a year, like "The Flash (2014)", include the year in the search

                if (showNameResponse.year) {
                    name = name + " " + "(" + showNameResponse.year + ")";
                }

                //




                //Here's where the actual search for the show happens

                Meteor.call('searchShow4', name, Meteor.bindEnvironment(function(error, result) {

                    if (error) {

                        //notifications.emit('message', error);
                        future.return("Error searching " + series_name + ". " + error);

                    }
                    else {

                        //notifications.emit('message', result);
                        var results = result;
                        var array = result[0]; // The first show found
                        var series_name = array.SeriesName;
                        var overview = array.Overview;
                        var show_id = array.id;
                        var banner = "http://thetvdb.com/banners/" + array.banner;
                        notifications.emit('message', "I found a show folder for " + series_name + ". Let's see if you already have it.");
                        var show = Tv.findOne({ // Check if the show already exists in the database
                            name: series_name,
                            section: sectionId
                        });
                        if (!show) { // If the show doesn't exist in the database

                            Meteor.call('searchShow5', show_id, Meteor.bindEnvironment(function(error, result) { // Pull some more data from the show

                                //notifications.emit('message', result);


                                //var series_id = it.seriesid;
                                //var series_name = it.SeriesName;
                                var language = result.language;
                                var poster = "http://thetvdb.com/banners/" + result.poster;
                                //series = it.SeriesName;
                                notifications.emit('message', "Looks like you don't already have " + series_name + ". I'm going to add it.");

                                // I want to pull air times from something else in the longrun.
                                //var air_day = result.Airs_DayOfWeek;
                                //var air_time = result.AirTime;

                                //notifications.emit('message', "Nothing found in the DB for " + series_name + ". Let's add it then."); 

                                Tv.insert({
                                    name: series_name,
                                    overview: overview,
                                    banner: banner,
                                    language: language,
                                    show_id: show_id,
                                    series_id: show_id,
                                    poster: poster,
                                    results: results,
                                    episode_info: result.Episodes,
                                    seasons: [],
                                    section: sectionId,
                                });

                                //notifications.emit('message', result);
                                future.return({
                                    series: series_name,
                                    notification: "Just added " + series_name
                                });

                            }))

                        }

                        else {

                            //notifications.emit('message', name + " is already in the DB.");
                            future.return({
                                series: series_name,
                                seasons: show.seasons,
                                notification: "It looks like " + series_name + " is already in the DB."
                            });

                        }



                    }

                }));

            }
            else { // If the extracted data does include a season number. Look more at this later, because this may be the fix to having shows with numbers being figured out correctly.


                // If it includes a country, make sure to include it in the search

                if (showNameResponse.country) {

                    var country = showNameResponse.country;

                    var country2 = countrynames.getCode(country);

                    name = name + " " + country2;

                }

                //

                // If it includes a year, like "The Flash (2014)", include the year in the search

                if (showNameResponse.year) {
                    name = name + " " + "(" + showNameResponse.year + ")";
                }

                //

                Meteor.call('searchShow4', name, Meteor.bindEnvironment(function(error, result) {

                    if (error) {

                        //notifications.emit('message', error);
                        future.return("Error searching " + series_name + ". " + error);

                    }
                    else {
                        var results = result;
                        var array = result[0];
                        var series_name = array.SeriesName;
                        var overview = array.Overview;
                        var show_id = array.id;
                        var banner = "http://thetvdb.com/banners/" + array.banner;
                        var show = Tv.findOne({
                            name: series_name,
                            section: sectionId
                        });

                        // I need to figure out a way to double check to make sure the folder is a season folder, and not just a show with numbers.


                        if (!show) {

                            notifications.emit('message', "There isn't a show named " + series_name + " in the database.");

                        }
                        else {
                            //notifications.emit('message', name + " is already in the DB.");
                            future.return({
                                series: series_name,
                                seasons: show.seasons,
                                notification: series_name + " 2 is already in the DB."
                            });
                        }



                    }

                }));

            }

        }
        else {

            future.return({
                notification: "Didn't know what to do with " + name + ". My guess: "
            });
            notifications.emit('message', showNameResponse);


        }


        return future.wait();

    },




    episodes: function(file, name, season, seasonNumber, sectionId) { // This function seems to be the one causing the most performance problems. But I'm also getting multiple resolved futures on the file function earlier.

        notifications.emit('message', "Current season for " + name);
        notifications.emit('message', seasonNumber);
        var folder = path.basename(encodeURIComponent(file)),
            episodes = [],
            walk = Meteor.npmRequire('walk'),
            fs = Meteor.npmRequire('fs'),
            future = new Future(),
            walker;
        walker = walk.walk(file);


        walker.on("file", Meteor.bindEnvironment(function(root, fileStats, next) { // When it finds a file in the folder
            //notifications.emit('message', root);
            //notifications.emit('message', fileStats);
            var episodeName = fileStats.name;

            Meteor.call('episodeName', episodeName, Meteor.bindEnvironment(function(error, result) {


                if (error) {
                    notifications.emit('message', error);
                }
                else {

                    var episodeNumber = result.episode;
                    notifications.emit('message', result);

                    if (season) {

                        episodes = season.episodes;
                        //seasonNumber = season.season_number;
                        var location = root + "/" + episodeName;


                        var episodeExist = episodes.filter(function(obj) { // See if the episode already exists
                            if (obj.episode === episodeNumber) {
                                var sameLocation = obj.location.indexOf(location);
                                notifications.emit('message', "sameLocation");
                                notifications.emit('message', sameLocation);
                                if (sameLocation >= 0) { // Make sure not to add the same exact episode file.
                                    notifications.emit('message', "Episode " + episodeNumber + " in this location is already in the database.");
                                }
                                else {
                                    obj.location.push(root + "/" + episodeName);
                                    notifications.emit('message', "I just added another versions of episode " + episodeNumber);
                                    notifications.emit('message', obj);
                                }
                                return obj;

                            }
                        })[0];
                        notifications.emit('message', "episodeExist");
                        notifications.emit('message', episodeExist);

                        if (!episodeExist) {

                            var episode = {
                                location: [root + "/" + episodeName],
                                episode: result.episode
                            }

                            episodes.push(episode);

                        }

                    }
                    else {

                        var episodeExist = episodes.filter(function(obj) { // See if the episode already exists
                            if (obj.episode === episodeNumber) {
                                var sameLocation = obj.location.indexOf(location);
                                notifications.emit('message', "sameLocation");
                                notifications.emit('message', sameLocation);
                                if (sameLocation >= 0) { // Make sure not to add the same exact episode file.
                                    notifications.emit('message', "Episode " + episodeNumber + " in this location is already in the database.");
                                }
                                else {
                                    obj.location.push(root + "/" + episodeName);
                                    notifications.emit('message', "I just added another versions of episode " + episodeNumber);
                                    notifications.emit('message', obj);
                                }
                                return obj;

                            }
                        })[0];
                        notifications.emit('message', "episodeExist");
                        notifications.emit('message', episodeExist);

                        if (!episodeExist) {

                            var episode = {
                                location: [root + "/" + episodeName],
                                episode: episodeNumber
                            }

                            episodes.push(episode);

                        }

                    }

                }


            }))


            next();
        }));


        walker.on("end", Meteor.bindEnvironment(function() {


            notifications.emit('message', "Finished season " + seasonNumber + " of " + name + " Here's all of the episodes for the season:");
            notifications.emit('message', episodes);

            if (season) {

                season.episodes = episodes;

            }


            //notifications.emit('message', find_show);


            var find_show = Tv.findOne({
                name: name,
                section: sectionId
            });
            /*
                                    
            if (seasonBool == false) {
                
                var seasons = {
                season_number: result.season,
                episodes: episodes
            }
                
            } else {
                
                var seasons = seasons1
                
                
            }

            */

            if (find_show) {

                current_seasons = [];
                notifications.emit('message', "Test Show");
                notifications.emit('message', find_show);
                if (find_show.seasons.length > 0) {

                    find_show.seasons.forEach(function(file, index, array) {


                        current_seasons.push(file.season_number);

                    });
                }
                // The current seasons area seems to be slightly wrong. It works, but seems to not show the correct number of seasons sometimes.
                notifications.emit('message', "Current seasons for " + name);
                notifications.emit('message', current_seasons);




                if (seasonNumber && current_seasons.indexOf(seasonNumber) >= 0) {

                    //notifications.emit('message', "Looks like season " + result.season + " of " + name + " already exists.");


                    var tv_update3 = Tv.update({
                            _id: find_show._id,
                            'seasons.season_number': seasonNumber,
                            section: sectionId,
                        }, {
                            $set: {
                                "seasons.$.episodes": episodes
                            }
                        }, {
                            multi: true
                        }

                    );
                    future.return("Looks like season " + seasonNumber + " of " + name + " already exists.");






                }
                else if (!season) {

                    notifications.emit('message', "Found " + name + " in DB, adding the episodes to it!");
                    notifications.emit('message', season);


                    Tv.update({
                        _id: find_show._id,
                        section: sectionId,
                    }, {
                        $push: {
                            'seasons': {

                                episodes: episodes,
                                poster: "",
                                posters: [],
                                season_number: seasonNumber,

                            }
                        }
                    });

                    future.return("Added episodes to " + name + " season " + seasonNumber);

                }
                else {

                }

            }
            else {
                future.return("No show found in DB for " + name);
            }



        }));










        return future.wait();





    },








    directoryRecur: function(directory, name, seasons, sectionId) {

        var walk = Meteor.npmRequire('walkdir');
        var emitter2 = walk(directory),
            future = new Future();

        notifications.emit('message', "seasons test");
        notifications.emit('message', seasons);

        //var seasons = [];

        var more = [];
        var episode_array = [];
        var directories = [];
        //var season = "";

        emitter2.on('directory', Meteor.bindEnvironment(function(dir, stat) {

            directories.push(dir);

        }));



        emitter2.on("file", Meteor.bindEnvironment(function(root, fileStats, next) {


            Meteor.call('showName', fileStats.name, Meteor.bindEnvironment(function(error, result) { // Check the folder name to make sure it's a season.

                if (error) {

                    notifications.emit('message', error);
                    //future.return(error);

                }
                else {


                    looseEpisodes.push({
                        name: result.title,
                        season: result.season,
                        episode: result.episode,
                        location: root + "/" + fileStats.name
                    })


                }


            }));

        }));




        emitter2.on('end', Meteor.bindEnvironment(function(path1, stat) {

            directories.forEach(function(file, index, array) {

                notifications.emit('message', "Checking the folder " + file);

                var folder = path.basename(file);


                Meteor.call('showName', folder, Meteor.bindEnvironment(function(error, result) { // Check the folder name to make sure it's a season.

                    if (error) {

                        notifications.emit('message', error);
                        //future.return(error);

                    }
                    else {


                        if (result.season && !result.episode) { // If there's a season, but no episode


                            var season = result.season;

                            if (season && seasons) { // No point trying to filter through nothing, and spitting out undefined errors.

                                notifications.emit('message', "seasons test");
                                notifications.emit('message', seasons);

                                var seasonExist = seasons.filter(function(obj) { // Look for a season with the current season number.
                                    return +obj.season_number === +season;
                                })[0];

                            }

                            notifications.emit('message', "check test");
                            notifications.emit('message', season);
                            notifications.emit('message', seasonExist);

                            var response = Meteor.myFunctions.episodes(file, name, seasonExist, season, sectionId);

                            notifications.emit('message', response);




                        }





                    }


                }))















            });
            
            
            future.return("Done with " + name);


        }));


        return future.wait();

    },



    looseFoldersFunction: function(sectionId) {

        var future = new Future();

        // I'll group the loose folders together by series name. -- Need to add a regex in here to not care about capitalization.

        var groups = {};

        for (var i = 0; i < looseFolders.length; ++i) {
            var obj = looseFolders[i];

            //If an array with this name doesn't exist
            if (groups[obj.name] === undefined)
                groups[obj.name] = {
                    episodes: [obj],
                    name: obj.name
                }; //Add an episodes array to house the episodes and a name field for the series name.

            //groups will always be the array corresponding to the current name. Push value.
            groups[obj.name].episodes.push(obj);
        }

        var groupedFolders = Object.keys(groups).map(function(key) {
            return groups[key]
        }); // Convert the resulting groups from an object to an array.


        notifications.emit('message', "Groups");
        notifications.emit('message', groups);
        notifications.emit('message', groupedFolders);


        groupedFolders.forEach(function(file, index, array) {

            var walk = Meteor.npmRequire('walk');
            var showName = file.name;
            notifications.emit('message', "Grouped Show");
            notifications.emit('message', showName);
            notifications.emit('message', file);


            Meteor.call('searchShow4', showName, Meteor.bindEnvironment(function(error, result) {

                if (error) {

                    notifications.emit('message', "Error searching " + file.name + ". " + error);

                }
                else {

                    //notifications.emit('message', result);
                    var results = result;
                    var array = result[0]; // The first show found
                    var series_name = array.SeriesName;
                    var overview = array.Overview;
                    var show_id = array.id;
                    var banner = "http://thetvdb.com/banners/" + array.banner;
                    notifications.emit('message', "Seeing if you have " + series_name + " already in the database.");
                    notifications.emit('message', sectionId);
                    var show = Tv.findOne({ // Check if the show already exists in the database
                        name: series_name,
                        section: sectionId
                    });



                    file.episodes.forEach(function(file, index, array) {

                        var walkLooseFolder = walk.walk(file.location);

                        walkLooseFolder.on("file", Meteor.bindEnvironment(function(root, fileStats, next) {

                            var location = file.location + "/" + fileStats.name;

                            var video = Meteor.myFunctions.isVideoNotSample(fileStats.name, location);

                            var insertId;

                            if (video) {

                                notifications.emit('message', "Found a video in a loose folder " + fileStats.name + " at " + location);


                                if (!show && index === 0) { // If the show doesn't exist in the database

                                    Meteor.call('searchShow5', show_id, Meteor.bindEnvironment(function(error, result) { // Pull some more data from the show

                                        var language = result.language;
                                        var poster = "http://thetvdb.com/banners/" + result.poster;
                                        notifications.emit('message', "test - Looks like you don't already have " + series_name + ". I'm going to add it.");

                                        insertId = Tv.insert({
                                            name: series_name,
                                            overview: overview,
                                            banner: banner,
                                            language: language,
                                            show_id: show_id,
                                            series_id: show_id,
                                            poster: poster,
                                            results: results,
                                            episode_info: result.Episodes,
                                            seasons: [{

                                                season_number: file.season,
                                                episodes: [

                                                    {

                                                        episode: file.episode,
                                                        location: [

                                                            location

                                                        ]

                                                    }

                                                ],
                                                poster: null,
                                                posters: null,

                                            }],
                                            section: sectionId,
                                        });

                                        notifications.emit('message', 'insertId');
                                        notifications.emit('message', insertId);

                                    }))

                                }

                                else { // If the show is already in the database



                                    notifications.emit('message', "test - I found " + file.name + " in the database. I'll add this episode to it.");
                                    notifications.emit('message', series_name);
                                    notifications.emit('message', sectionId);
                                    notifications.emit('message', insertId);


                                    /*   
                                                            var show2 = Tv.findOne({
                                                                name: series_name,
                                                                section: sectionId
                                                            });   
                                                            */

                                    var show2 = Tv.find({
                                        section: sectionId
                                    }).fetch();

                                    notifications.emit('message', show2);


                                    /*
                                                                
                                                                var checkSeasons = [];
                                                                
                                                                
                                                                
                                                                show2.seasons.forEach(function(file, index, array) {
        
                                                                    checkSeasons.push(file.season_number);
                        
                                                                });
                                                                
                                                                
                                                                if (checkSeasons.indexOf(file.season) >= 0) {
                        
                        
                                                                    var tv_update3 = Tv.update({
                                                                            _id: show2._id,
                                                                            'seasons.season_number': file.season,
                                                                            section: sectionId,
                                                                        }, {
                                                                        $push: {
                                                                        
                                                                            "seasons.$.episodes": {
                                                                                
                                                                                episode: file.episode,
                                                                                location: location
                                                                                
                                                                            }
                                                                        
                                                                        
                                                                        }
                                                                        }, {
                                                                            multi: true
                                                                        }
                        
                                                                    );
                                                                    
                        
                        
                        
                        
                        
                                                                }
                                                                else {
                                                                
                                                                    Tv.update({
                                                                        _id: show2._id,
                                                                        section: sectionId,
                                                                    }, {
                                                                        $push: {
                                                                            'seasons': {
                                                                             
                                                                                episodes: [
                                                                                
                                                                                    {
                                                                                    
                                                                                        episode: file.episode,
                                                                                        location: location
                                                                                        
                                                                                    }
                                                                                
                                                                                ],
                                                                                poster: "",
                                                                                posters: [],
                                                                                season_number: file.season,   
                                                                                
                                                                            }
                                                                        }
                                                                    });
                        
                                                                }
                                                                
                                                                */


                                }




                            }

                            next();

                        }));

                        /*          
                                        walkLooseFolder.on("end", Meteor.bindEnvironment(function() {
                
                                            future.return("Done looking through loose folders.");
                                            
                                        }));
                                        */


                    });


                }

            }));


        });

        future.return("Done looking through loose folders.");


        return future.wait();

    },


    isVideo: function(file) {

        var path = Meteor.npmRequire('path');
        var ext = path.extname(file);

        if (videoFormats.indexOf(ext) > -1) {
            return true;
        }

    },

    isSample: function(file) {

        var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        var Future = Meteor.npmRequire('fibers/future');
        var future = new Future();

        console.log("checking if sample file - " + file);

        ffmpeg.ffprobe(file, function(err, metadata) { // Maybe the issue is with the function here. Maybe look at fluent ffmpeg docs
            if (metadata && metadata.format.duration > 300) {

                future.return(true);

            }



            else {

                future.return(false);

            }

        });

        return future.wait();

    },

    isVideoNotSample: function(file, location) {

        var path = Meteor.npmRequire('path');
        var Future = Meteor.npmRequire('fibers/future');
        var future = new Future();
        var ext = path.extname(file);

        if (videoFormats.indexOf(ext) > -1) {

            var isSample = Meteor.myFunctions.isSample(location);

            future.return(isSample);


        }
        else {

            future.return(false);

        }


        return future.wait();

    },

};
