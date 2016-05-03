var videoFormats = [".avi", ".mkv", ".mp4", ".vob", ".ts", ".m2ts", ".mpg", ".wmv"];
import Future from 'fibers/future';
import path from 'path';
//var Future = Meteor.npmRequire('fibers/future');
//var path = Meteor.npmRequire('path');
import walk from 'walkdir';
import walk2 from 'walk';
import countrynames from 'countrynames';
import ffmpeg from 'fluent-ffmpeg';
var looseFolders = [];
var looseEpisodes = [];

Meteor.startup(function() {
        
        
         var future = new Future();
         
         
});

Meteor.myFunctions = {
    
    
    
    
    detectIE: function() {
        
        var ua = window.navigator.userAgent;

        // Test values; Uncomment to check result …

        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

        // IE 12 / Spartan
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

        // Edge (IE 12+)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    },
    
    
    qualityCheck: function(quality) {


        var future = new Future();


        if (quality === "1080") {
            
            future.return(".withVideoCodec('libvpx').addOptions(['-qmin 10', '-qmax 42', '-quality good', '-crf 20', '-cpu-used -6', '-threads 0', '-f webm', '-deadline realtime']).withVideoBitrate(2200).withAudioCodec('libvorbis').audioBitrate('128k').audioChannels(2).fps(24).withSize('1920x1080').format('webm')")
            
                
        } else if (quality === "720") {
            
            future.return(".withVideoCodec('libvpx').addOptions(['-qmin 10', '-qmax 42', '-quality good', '-crf 20', '-cpu-used -6', '-threads 0', '-f webm', '-deadline realtime']).withVideoBitrate(2200).withAudioCodec('libvorbis').audioBitrate('128k').audioChannels(2).fps(24).withSize('1280x720').format('webm')")
            
        } else if (quality === "480") {
            
            future.return(".withVideoCodec('libvpx').addOptions(['-qmin 10', '-qmax 42', '-quality good', '-crf 20', '-cpu-used -6', '-threads 0', '-f webm', '-deadline realtime']).withVideoBitrate(2200).withAudioCodec('libvorbis').audioBitrate('128k').audioChannels(2).fps(24).withSize('640x480').format('webm')")
            
        } else if (quality === "360") {
            
            future.return(".withVideoCodec('libvpx').addOptions(['-qmin 10', '-qmax 42', '-quality good', '-crf 20', '-cpu-used -6', '-threads 0', '-f webm', '-deadline realtime']).withVideoBitrate(2200).withAudioCodec('libvorbis').audioBitrate('128k').audioChannels(2).fps(24).withSize('480x360').format('webm')")
            
        }

        return future.wait();

    },

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
        
        notifications.emit('message', "Running a show search on " + name + " " + location);
        if (showNameResponse.title && showNameResponse.season && showNameResponse.episode) { // If all of these, I will assume it's an episode folder, and will do somethig with it later.
            looseFolders.push({
                name: name,
                season: showNameResponse.season,
                episode: showNameResponse.episode,
                location: location,
                date: new Date()
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
                        notifications.emit('message', array);
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
                                var backdrop = "http://thetvdb.com/banners/" + result.fanart;
                                //series = it.SeriesName;
                                notifications.emit('message', "Looks like you don't already have " + series_name + ". I'm going to add it.");
                                notifications.emit('message', result);

                                // I want to pull air times from something else in the longrun.
                                //var air_day = result.Airs_DayOfWeek;
                                //var air_time = result.AirTime;

                                //notifications.emit('message', "Nothing found in the DB for " + series_name + ". Let's add it then."); 

                                Tv.insert({
                                    name: series_name,
                                    overview: overview,
                                    banner: banner,
                                    backdrop: backdrop,
                                    language: language,
                                    show_id: show_id,
                                    series_id: show_id,
                                    poster: poster,
                                    results: results,
                                    episode_info: result.Episodes,
                                    seasons: [],
                                    episodes: [],
                                    section: sectionId,
                                    date: new Date(),
                                    date_updated: new Date(),
                                });
                                

                                //notifications.emit('message', result);
                                future.return({
                                    series: series_name,
                                    notification: "Just added " + series_name
                                });

                            }));

                        }

                        else {

                            //notifications.emit('message', name + " is already in the DB.");
                            future.return({
                                series: series_name,
                                seriesExist: true,
                                seasons: show.seasons,
                                episodes: show.episodes,
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
                                episodes: show.episodes,
                                notification: series_name + " is already in the DB."
                            });
                        }



                    }

                }));

            }

        }
        else {

            future.return({
                notification: "Didn't know what to do with " + name
            });
            notifications.emit('message', showNameResponse);


        }


        return future.wait();

    },



 // Add a check to make sure I don't add duplicate seasons like it's doing currently.
    episodes: function(file, name, season, seasonNumber, sectionId, seasonEpisodes) {

        notifications.emit('message', "Looking for episodes for " + name + " season " + seasonNumber);
        /*
        notifications.emit('message', "episodes");
        notifications.emit('message', episodes);
        notifications.emit('message', "seasonNumber");
        notifications.emit('message', seasonNumber);
        notifications.emit('message', "file");
        notifications.emit('message', file);
        notifications.emit('message', "season");
        notifications.emit('message', season);
        notifications.emit('message', "Season episodes");
        notifications.emit('message', seasonEpisodes);
        */
        var folder = path.basename(encodeURIComponent(file)),
            episodesArray = [],
            future = new Future(),
            walker = walk2.walk(file);


        walker.on("file", Meteor.bindEnvironment(function(root, fileStats, next) { // When it finds a file in the folder
        
            var episodeName = fileStats.name;
            var fileLocation = root + "/" + episodeName;
            notifications.emit('message', "Found file in season " + seasonNumber + " of " + name);
            /*
            notifications.emit('message', "root");
            notifications.emit('message', root);
            notifications.emit('message', "fileStats");
            notifications.emit('message', fileStats);
            notifications.emit('message', "fileLocation");
            notifications.emit('message', fileLocation);
            */
            
            
            var videoMetadata = Meteor.myFunctions.videoMetadata(fileLocation); // Get all the metadata for the video - things like duration, etc.
            
            
            
            
            if (videoMetadata && videoMetadata.format !== undefined) { // If successful getting video metadata. If not, it's either not a video or is corrupted, etc.
                var duration = videoMetadata.format.duration;
                var metadata = videoMetadata.format;
                
                
                Meteor.call('episodeName', episodeName, Meteor.bindEnvironment(function(error, result) {
    
    
                    if (error) {
                        notifications.emit('message', error);
                    }
                    else {
                        
                        var episodeNumber = result.episode;
    
                        if (seasonEpisodes) {
    
    
                            var episodeExist = seasonEpisodes.filter(function(obj) { // See if the episode already exists in the season episodes from the db
                                if (obj.episode === episodeNumber && obj.season_number === seasonNumber) { // Maybe map out an array of episodes for the season beforehand? This way I wouldn't have to check against so many episodes a ton of times - just the ones in the season.
                                    var sameLocation = obj.location.indexOf(fileLocation);
                                    if (sameLocation >= 0) { // Make sure not to add the same exact episode file.
                                        notifications.emit('message', "Episode " + episodeNumber + " for " + name + " season " + seasonNumber + " at this location is already in the database. I won't do anything with this.");
                                    }
                                    else {
                                        obj.location.push(root + "/" + episodeName);
                                        notifications.emit('message', "I just added another versions of episode " + episodeNumber + " for " + name + " season " + seasonNumber);
                                    }
                                    return obj;
    
                                }
                            })[0];
    
                            if (!episodeExist) {
                                
                                
                                var episodeExist2 = episodesArray.filter(function(obj) { // See if the episode already exists in the episodes for this run
                                    if (obj.episode === episodeNumber) {
                                        
                                        var sameLocation = obj.location.indexOf(fileLocation);
                                        if (sameLocation >= 0) { // Make sure not to add the same exact episode file.
                                            notifications.emit('message', "Episode " + episodeNumber + " for " + name + " season " + seasonNumber + " at this location is already in the database. I won't do anything with this.");
                                        }
                                        else {
                                            obj.location.push(root + "/" + episodeName);
                                            notifications.emit('message', "I just added another versions of episode " + episodeNumber + " for " + name + " season " + seasonNumber);
                                        }
                                        return obj;
        
                                    }
                                })[0];
                                
                                if (!episodeExist2) {
    
                                var episode = {
                                    season_number: seasonNumber,
                                    location: [root + "/" + episodeName],
                                    episode: result.episode,
                                    watched: false,
                                    date: new Date(),
                                    runtime: duration,
                                    metadata: metadata
                                };
    
                                episodesArray.push(episode);
                                
                                }
    
                            }
    
                        }
                        else {
    
    
                                var episodeExist2 = episodesArray.filter(function(obj) { // See if the episode already exists in the episodes for this run
                                    if (obj.episode === episodeNumber) {
                                        
                                        var sameLocation = obj.location.indexOf(fileLocation);
                                        notifications.emit('message', "sameLocation");
                                        notifications.emit('message', sameLocation);
                                        if (sameLocation >= 0) { // Make sure not to add the same exact episode file.
                                            notifications.emit('message', "Episode " + episodeNumber + " for " + name + " season " + seasonNumber + " at this location is already in the database. I won't do anything with this.");
                                        }
                                        else {
                                            obj.location.push(root + "/" + episodeName);
                                            notifications.emit('message', "I just added another versions of episode " + episodeNumber + " for " + name + " season " + seasonNumber);
                                        }
                                        return obj;
        
                                    }
                                })[0];
                                
                                if (!episodeExist2) {
    
                                var episode = {
                                    season_number: seasonNumber,
                                    location: [root + "/" + episodeName],
                                    episode: result.episode,
                                    watched: false,
                                    date: new Date(),
                                    runtime: duration,
                                    metadata: metadata
                                };
    
                                episodesArray.push(episode);
                                
                                }
    
                        }
    
                    }
    
    
                }));
                
                
                
                
                
                
                
                
                
                
            }
            

            


            next();
        }));


        walker.on("end", Meteor.bindEnvironment(function() {


            notifications.emit('message', "Finished season " + seasonNumber + " of " + name + " Here's all of the episodes I worked with:");
            notifications.emit('message', episodesArray);


            var find_show = Tv.findOne({
                name: name,
                section: sectionId
            });
            
            
            var showSeasons = [];
            
            
            if (find_show.seasons.length > 0) {

                    find_show.seasons.forEach(function(file, index, array) {


                        showSeasons.push(file.season_number);

                    });
                }




                if (showSeasons.indexOf(seasonNumber) >= 0) { // See if this season exists in the show.

                    var tv_update3 = Tv.update({
                            _id: find_show._id,
                            'seasons.season_number': seasonNumber,
                            section: sectionId,
                        }, {
                        $push: {
                            episodes: { $each: episodesArray }
                        }
                    }

                    );
                    future.return("Looks like season " + seasonNumber + " of " + name + " already exists.");


                } 
                
                else { // If this season doesn't exist

                    notifications.emit('message', "Found " + name + " in DB, adding the episodes to it!");


                    Tv.update({
                        _id: find_show._id,
                        section: sectionId,
                    }, {
                        $push: {
                            'seasons': {

                                poster: "",
                                posters: [],
                                season_number: seasonNumber,

                            },
                            episodes: { $each: episodesArray }
                        }
                    });

                    future.return("Added episodes to " + name + " season " + seasonNumber);

                }



        }));










        return future.wait();





    },








    directoryRecur: function(directory, name, seasons, sectionId, episodes) {
        
        var emitter2 = walk(directory),
            future = new Future(),
            directories = [];

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


                    looseEpisodes.push({ // Push the episode to the looseEpisodes array to deal with later
                        name: result.title,
                        season: result.season,
                        episode: result.episode,
                        location: root + "/" + fileStats.name,
                        date: new Date()
                    });


                }


            }));

        }));




        emitter2.on('end', Meteor.bindEnvironment(function(path1, stat) { // When done looking throught the directory
        
        notifications.emit('message', "All seasons for " + name);
        notifications.emit('message', seasons);

            directories.forEach(function(file, index, array) { // Each director that was found

                notifications.emit('message', "Checking the folder " + file);

                var folder = path.basename(file); // Remove the ancestor file tree


                Meteor.call('showName', folder, Meteor.bindEnvironment(function(error, result) { // Check the folder name to make sure it's a season.

                    if (error) {

                        notifications.emit('message', error);
                        //future.return(error);

                    }
                    else {


                        if (result.season && !result.episode) { // If there's a season, but no episode


                            var season = result.season;

                            if (season && seasons) { // No point trying to filter through nothing, and spitting out undefined errors.

                                var seasonExist = seasons.filter(function(obj) { // Look for a season with the current season number.
                                    return obj.season_number === season;
                                })[0];
                                
                                if (seasonExist) {
                                    
                                    var seasonEpisodes = episodes.filter(function(obj) { // See if the episode already exists
                                        return obj.season_number === season;
                                    });
                                    
                                    
                                    
                                }

                            }

                            var response = Meteor.myFunctions.episodes(file, name, seasonExist, season, sectionId, seasonEpisodes); // Need to pass episodes in here too since I moved them out of seasons.




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

            //var walk = Meteor.npmRequire('walk');
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

                        var walkLooseFolder = walk2.walk(file.location);

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
                                        var backdrop = "http://thetvdb.com/banners/" + result.fanart;
                                        notifications.emit('message', "test - Looks like you don't already have " + series_name + ". I'm going to add it.");

                                        insertId = Tv.insert({
                                            name: series_name,
                                            overview: overview,
                                            banner: banner,
                                            backdrop: backdrop,
                                            language: language,
                                            show_id: show_id,
                                            series_id: show_id,
                                            poster: poster,
                                            results: results,
                                            episode_info: result.Episodes,
                                            date_updated: new Date(),
                                            date: new Date(),
                                            seasons: [{

                                                season_number: file.season,
                                                poster: null,
                                                posters: null,

                                            }],
                                            episodes: [

                                                    {

                                                        episode: file.episode,
                                                        season_number: file.season,
                                                        location: [

                                                            location

                                                        ]

                                                    }

                                                ],
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

        //var path = Meteor.npmRequire('path');
        var ext = path.extname(file);

        if (videoFormats.indexOf(ext) > -1) {
            return true;
        }

    },

    isSample: function(file) {

        //var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        //var Future = Meteor.npmRequire('fibers/future');
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

        //var path = Meteor.npmRequire('path');
        //var Future = Meteor.npmRequire('fibers/future');
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
    
    videoMetadata: function(file) {

        //var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        //var Future = Meteor.npmRequire('fibers/future');
        var future = new Future();

        ffmpeg.ffprobe(file, function(err, metadata) { // Maybe the issue is with the function here. Maybe look at fluent ffmpeg docs
            if (metadata) {

                future.return(metadata);

            }



            else {

                //throw(err)
                future.return(err);

            }

        });

        return future.wait();

    },
    
    
    movieImages: function(movie_id, name, id, section){ 
        
        var future = new Future();
        
        Meteor.call('movieImages', movie_id, function(error, movie) { // Do a search on TMDB for movies matching the name

                        if (error) {
                            
                            console.log("ERROR ADDING IMAGES TO: " + name);
                            console.log(movie_id);
                            console.log(name);
                            console.log(id);
                            console.log(section);
                            console.log(error);
                            
                        }
                        else {
                
                
                            notifications.emit('message', 'Movie info for ' + name);
                            notifications.emit('message', movie);
                            
                            Movies.update({
                                _id: id,
                                section: section,
                            },
                            {
                                $set: {
                                    posters: movie.posters,
                                    backdrops: movie.backdrops
                                }
            
                            }, function(err, res) {
                                if (err) {
                                    notifications.emit('message', "ERROR ADDING IMAGES TO: " + name);
                                    notifications.emit('message', err);
                                    console.log("ERROR ADDING IMAGES TO: " + name);
                                    console.log(err);
                                    future.return(err);
                                }
                                else {
            
                                    console.log("SUCCESSFULLY ADDED IMAGES TO: " + name);
                                    future.return("SUCCESSFULLY ADDED IMAGES TO: " + name);
                                }
                            });
                            
                            
                            
                            
                            
                            
                            
                            
                
                
                        }
                        
                        
                        
                });
    
    
    
    return future.wait();
    
    },
    
    
    
    
    
    
/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
detectIE: function() {
  var ua = window.navigator.userAgent;

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
  
  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
  
  // IE 12 / Spartan
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
  
  // Edge (IE 12+)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
},
    
    
    
    

};
