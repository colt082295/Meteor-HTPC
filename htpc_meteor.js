Movies = new Meteor.Collection('movies');
Moviess = new Meteor.Collection('moviess');
Tv = new Meteor.Collection('tv');
Sections = new Meteor.Collection('sections');
Tmdb = new Meteor.Collection('tmdb');
ServerSettings = new Meteor.Collection('serverSettings');
notifications = new Meteor.Stream('server-notifications');
Images = new FS.Collection("images", {
    stores: [new FS.Store.FileSystem("images", {
        path: "/var/uploads1"
    })]
});

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function removeBrackets(input) {
    return input
        .replace(/{.*?}/g, "")
        .replace(/\[.*?\]/g, "")
        .replace(/<.*?>/g, "")
        .replace(/\(.*?\)/g, "");
}





var root = "";
var title = "";
var name = [];
var old_name = "";
var resulter = "";
var element = "";
var timeout = 0;
var url = "http://api.themoviedb.org/3/configuration?api_key=23290308516dcbfcb67fb0f330028492";
var base_url = "http://image.tmdb.org/t/p/w396";
var number = 0;
var finished = 0;
var movieLength = "";
var zero = 0;
var run = 0;
var id = "";
var metadata1 = "";
var removeId = [];
var search_running = "";
var timeoutId = 0;
var sectionId;

function parsePipeList(list) {
    return list.replace(/(^\|)|(\|$)/g, "").split("|");
}


Util = {};

// We need to store the dep, ready flag, and data for each call
Util.d_waitOns = {};

// This function returns a handle with a reactive ready function, which
// is what waitOn expects. waitOn will complete when the reactive function
// returns true.
Util.waitOnServer = function(name) {
    // This prevents the waitOnServer call from being called multiple times
    // and the resulting infinite loop.
    if (this.d_waitOns[name] !== undefined &&
        this.d_waitOns[name].ready === true) {
        return;
    }
    else {
        this.d_waitOns[name] = {};
    }
    var self = this;
    // We need to store the dependency and the ready flag.
    this.d_waitOns[name].dep = new Deps.Dependency();
    this.d_waitOns[name].ready = false;

    var callback = function(err, or) {
        // The call has complete, so set the ready flag, notify the reactive
        // function that we are ready, and store the data.
        self.d_waitOns[name].ready = true;
        self.d_waitOns[name].dep.changed();
        self.d_waitOns[name].data = (err || or);
    };

    var args = Array.prototype.slice.call(arguments)
    args.push(callback);

    Meteor.call.apply(this, args);

    // The reactive handle that we are returning.
    var handle = {
        ready: function() {
            self.d_waitOns[name].dep.depend();
            return self.d_waitOns[name].ready;
        }
    };
    return handle;
}

// Retrieve the data that we stored in the async callback.
Util.getResponse = function(name) {
    var data = this.d_waitOns[name].data;
    // Clear out the data so a second call with the same name wont return
    // the same data.
    this.d_waitOns[name] = {};
    return data;
}






if (Meteor.isClient) {




    Search = new Mongo.Collection('search');

    Meteor.subscribe("images");
    //Meteor.subscribe("movies");

    Meteor.startup(function() {


        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000"
        }

        toastr.clear();
        toastr.remove();
        notifications.on('message', function(message) {
        toastr.clear();
        toastr.remove();
        toastr.success(message);
        var d = new Date();
        console.log(d.getHours() + " " + d.getMinutes() + " " + d.getSeconds() + " " + d.getMilliseconds())
        console.log(message);
        });


    });
    
    Template.player.onDestroyed(function() {
        
        var oldPlayer = document.getElementById('video');
        videojs(oldPlayer).dispose();
        //videojs("video").dispose();
        console.log("Destroyed");
        
        
        
    })
    
    
        Template.player.onRendered(function() {
            
            var location = Session.get("location");
            
            var myVideo = document.createElement('video');
            if (myVideo.canPlayType('video/mp4')) {
                console.log("You can play mp4");
                Meteor.call('streamMp4', location, function(error, result) {
                  if (error) {
                      
                      console.log(error);
                      
                  } else {
                      
                      console.log(result);
                      //videojs("video").ready(function(){
                      var player = videojs("video").ready(function(){
                          
                          console.log('Good to go!');
                          this.bigPlayButton.hide();
                          this.loadingSpinner.show();
                          this.src({"type":"video/mp4", "src":"http://167.114.103.80:"+result.port});
                          this.load();
                          
                          this.on("play", function(){
                              
                            this.loadingSpinner.hide();
                    
                          });
      
                          this.on("loadedmetadata", function(){
                              
                            this.duration(result.duration);
                            this.play();
                            this.loadingSpinner.hide();
                    
                          });
          
                          this.on("seeking", function(){
                            
                            console.log('seeking 1' + this.currentTime() );
                            var time = this.currentTime();
                            
                            Meteor.call('streamSeek', location, time, function(error, result) {
                                      if (error) {
                                          
                                          console.log(error);
                                          
                                      } else {
                                          
                                          player.src({"type":"video/webm", "src":"http://167.114.103.80:"+result.port});
                                          //player.currentTime(time);
                                          player.play();
                                          
                                      }
                                         
                            });
                
                          });
                              
                        
                        this.on('ended', function() {
                        console.log('awww...over so soon?');
                        });
                    
                    
                });
                      
                      
                  }
            
            
            });
            
            
            }
            

    });
 
 
 Template.videoVersionModal.events({

        'click .video-version': function(event, template) {
            
            var index = event.currentTarget.id;
            var locations = Session.get("videoVersions");
            console.log(locations);
            console.log("The index value of the episode: " + index);
            Session.set("location", locations[index]);
            $('#videoVersionModal').foundation('close');
            Router.go('player');
            
        },
        
        
 });




Template.viewSeasonPage.events({

        'click .episode_wrapper': function(event, template) {
            
            if (this.location.length > 1) { // If multiple versions of the video
                
                $('#videoVersionModal').foundation('open');
                Session.set("videoVersions", this.location);
                
            } else { // Only one version of the video
            
            Session.set("location", this.location[0]);
            Router.go('player');
            
            }
            
        },
        
        
        
        
        
        
});

Template.login.events({

        'submit #login': function(event, template) {
            
            event.preventDefault();
            var username = $('#username').val();
            var password = $('#password').val();
            
            Meteor.loginWithPassword(username,password,function(err){
                if(!err) {
                    Router.go('/');
                } else {
                  alert("There was an error logging in: " + err.reason);
                }
            });
            
            
        },
        
        
        
        
});


Template.register.events({

        'submit #register': function(event, template) {
            
            event.preventDefault();
            var username = $('#username').val();
            var password = $('#password').val();
            var email = $('#email').val();
            var admin = false;
            
            var users = this.users;
            
            console.log("users");
            console.log(users.length);
            
            if (users.length > 0) { // If there are no users registered
                console.log("There are users");
                admin = false;
            } else {
                
                
                console.log("There's no users");
                admin = true;
            }
     
            var user = {
              
                email: email,
                username: username,
                password:password,
                profile:{
                  admin: admin
                }
              
            };
            
            Accounts.createUser(user,function(err){
                if(err) {
                    alert("There was an error, please try again" + err.reason);
                } else {
                  //Router.go('/login');
                  console.log(username + " is now a user");
                  Meteor.loginWithPassword(username,password,function(err){
                    if(!err) {
                        Router.go('/');
                    } else {
                      alert("There was an error logging in: " + err.reason);
                    }
                  });
                  
                  
                }
            });
            
        },  
        
        'click #remove-users': function(event, template) {
            
            
            Meteor.call('removeUsers', function(error, result) {
                  if (error) {
                      
                      console.log(error);
                      
                  } else {
                      
                      console.log("Removed all users.");
                      
                  }
                  
             });
            
            
            
        },
        
});

Template.videoVersionModal.helpers({
    
    videoVersions: function() {
         
         return Session.get("videoVersions");

        },
    
    
    
    
    
});

    Template.viewSeasonPage.helpers({
        
        episodes: function() {

            return this.episodes.sort(function(obj1, obj2) {
                // Ascending: first age less than the previous
                return obj1.episode - obj2.episode;
            });

        },
        
        
    });
    
    
    Template.sidebar.helpers({

        sections: function() {

            return Sections.find({});

        },
        
        


    });
    
    
    
    Template.addContentSidebar.helpers({
        
        directories: function() {

            return Session.get("directories");

        },
        
        
    });
    
    
    
    
    Template.addContentSidebar.events({
        
        'keyup #new-content-location': function(event, template){
            
            clearTimeout(timeoutId); // doesn't matter if it's 0
            timeoutId = setTimeout(function(){
        
              console.log( "Handler for .keypress() called." );
              
              var folder = $('#new-content-location').val();
                
                Meteor.call('folderTree', folder, function(error, result) {
    
                    if (error) {
    
                        console.log("There was an error checking the directory. " + error);
    
                    }
                    else {
    
                        console.log("Looked in the directory." + folder);
                        Session.set("directories", result);
                        console.log(result);
    
                    }
    
                });
            
            
            
            }, 500);
            
            
            
            
        },
        
         'click #adding-content #submit': function(event, template) {
            
            event.preventDefault();
            
            console.log("started content add procedure");
            
            var name =  $('#new-content-name').val();
            var location =  $('#new-content-location').val();
            var format =  $( "#new-content-format" ).val();

            Meteor.call('addSection', name, location, format, function(error, result) {

                if (error) {

                    console.log("There was an error adding the section. " + error);

                }
                else {

                    console.log("Added new section.");
                    //$('#add-content').foundation('close');
                    $('[data-remodal-id=modal]').remodal().close();
                    
                    
                    
                    
                    

                }

            });


        },
        
        'click #adding-content .directory': function(event, template) {
            
            var target = event.target.text;
            var folder = $('#new-content-location').val();
            console.log(target);
            
            folder = folder.replace(/\/?$/, '/'); // If no trailing slash, add it
            folder = folder + target; // Add on the new folder
            $('#new-content-location').val(folder);
                
                Meteor.call('folderTree', folder, function(error, result) {
    
                    if (error) {
    
                        console.log("There was an error checking the directory. " + error);
    
                    }
                    else {
    
                        console.log("Looked in the directory." + folder);
                        Session.set("directories", result);
                        console.log(result);
    
                    }
    
                });
            
            
        },
        
        'click #adding-content #up-directory': function(event, template) {
            
            var folder = $('#new-content-location').val();
            
            folder = folder.substr(0, folder.lastIndexOf("/"));
            $('#new-content-location').val(folder);
            console.log(folder);
                
                Meteor.call('folderTree', folder, function(error, result) {
    
                    if (error) {
    
                        console.log("There was an error checking the directory. " + error);
    
                    }
                    else {
    
                        console.log("Looked in the directory." + folder);
                        Session.set("directories", result);
                        console.log(result);
    
                    }
    
                });
            
            
        },
        
        
        
    });
    
    
    
        Template.editContentSidebar.helpers({
        
        directories: function() {

            return Session.get("directories");

        },
        
        
    });
    
    
    
    Template.editContentSidebar.events({
        
        
        
        'keyup #edit-content-location': function(event, template){
            
            clearTimeout(timeoutId); // doesn't matter if it's 0
            timeoutId = setTimeout(function(){
        
              console.log( "Handler for .keypress() called." );
              
              var folder = $('#edit-content-location').val();
                
                Meteor.call('folderTree', folder, function(error, result) {
    
                    if (error) {
    
                        console.log("There was an error checking the directory. " + error);
    
                    }
                    else {
    
                        console.log("Looked in the directory." + folder);
                        Session.set("directories", result);
                        console.log(result);
    
                    }
    
                });
            
            
            
            }, 500);
            
            
            
            
            
        },
        
        
        'click #editing-content .directory': function(event, template) {
            
            var target = event.target.text;
            var folder = $('#edit-content-location').val();
            console.log(target);
            
            folder = folder.replace(/\/?$/, '/'); // If no trailing slash, add it
            folder = folder + target; // Add on the new directory
            $('#edit-content-location').val(folder);
                
                Meteor.call('folderTree', folder, function(error, result) {
    
                    if (error) {
    
                        console.log("There was an error checking the directory. " + error);
    
                    }
                    else {
    
                        console.log("Looked in the directory." + folder);
                        Session.set("directories", result);
                        console.log(result);
    
                    }
    
                });
            
            
        },
        
        
        'click #editing-content #up-directory': function(event, template) {
            
            var folder = $('#edit-content-location').val();
            
            folder = folder.substr(0, folder.lastIndexOf("/"));
            $('#edit-content-location').val(folder);
            console.log(folder);
                
                Meteor.call('folderTree', folder, function(error, result) {
    
                    if (error) {
    
                        console.log("There was an error checking the directory. " + error);
    
                    }
                    else {
    
                        console.log("Looked in the directory." + folder);
                        Session.set("directories", result);
                        console.log(result);
    
                    }
    
                });
            
            
        },
        
        'submit #editing-content': function(event, template) {
            
            event.preventDefault();
            
            console.log("started content edit procedure");
            
            var name =  $('#edit-content-name').val();
            var location =  $('#edit-content-location').val();
            var format =  $( "#edit-content-format" ).val();
            var id = Session.get("editSection");

            Meteor.call('editSection', name, location, format, id, function(error, result) {

                if (error) {

                    console.log("There was an error editing the section. " + error);

                }
                else {

                    console.log("Edited section.");
                    $('#edit-content').foundation('close');

                }

            });


        },
        
        'click #remove-sections': function(event, template) {
            
            event.preventDefault();
            
            Meteor.call('removeSections', function(error, result) {

                if (error) {

                    console.log("There was an error removing sections. " + error);

                }
                else {

                    console.log("Removed all sections.");
                    $('#edit-content').foundation('close');

                }

            })


        },
        
        'click #remove-section': function(event, template) {
            
            event.preventDefault();
            
            var id = Session.get("editSection");
            
            console.log(id);
            
            Meteor.call('removeSection', id, function(error, result) {

                if (error) {

                    console.log("There was an error removing section. " + error);

                }
                else {

                    console.log("Removed section.");
                    $('#edit-content').foundation('close');

                }

            })


        },
        
        
        
    });
    


    
    Template.sidebar.events({
        
        
        
        'click .edit': function(event, template) {
            
            event.preventDefault();
            
            console.log("You clicked edit.");
            
            var name =  this.name;
            var location =  this.location;
            var format =  this.format;
            var id = this._id;
            
            Session.set("editSection", id);
            
            console.log(name);
            
            $('#edit-content').foundation('open');
            
            $('#edit-content-name').val(name);
            $('#edit-content-location').val(location);
            //$("#edit-content-format select").val(format);
            $( "#edit-content-format" ).val(format);
            
            var folder = location;
                
                Meteor.call('folderTree', folder, function(error, result) {
    
                    if (error) {
    
                        console.log("There was an error checking the directory. " + error);
    
                    }
                    else {
    
                        console.log("Looked in the directory." + folder);
                        Session.set("directories", result);
                        console.log(result);
    
                    }
    
                });


        },
        
        'click .add': function(event, template) {
            
            event.preventDefault();
            
            console.log("You clicked add.");
            
            $('#add-content').foundation('open');
            
            var folder = $( "#new-content-location" ).val();
            
                
                Meteor.call('folderTree', folder, function(error, result) {
    
                    if (error) {
    
                        console.log("There was an error checking the directory. " + error);
    
                    }
                    else {
    
                        console.log("Looked in the directory." + folder);
                        Session.set("directories", result);
                        console.log(result);
    
                    }
    
                });
                


        },

    });


    Template.home.helpers({
        movie: function() {
            return Moviess.find({}, {
                limit: 25
            });
        },
        show: function() {
            return Tv.find({});
        },
    });

    Template.movies.helpers({

        content: function() {
            return Moviess.find().fetch();
        },

    });
    
    var subMovie;
    
    Template.movies.onCreated(function() {
        
        var route = Router.current();
        
        console.log(route);
        
        subMovie = Meteor.subscribe('movies', route.params._id);

    });
    
    Template.movies.onDestroyed(function() {
        
        console.log("Section destroyed.");
        subMovie.stop();
        
        
    })

    Template.registerHelper('encodeName', function() {
        this.name = encodeURIComponent(this.name);
        return this;
    });

    Template.registerHelper('greater_one', function(a, b) {
        return a > b;
    });
    
    Template.registerHelper('equals', function(a, b) {
        return a === b;
    });

    Template.registerHelper('parentData',
        function() {
            return Template.parentData(1);
        }
    );

    Template.viewShowPage.helpers({
        section: function() {
            
            var route = Router.current();
        
            return route.params._id;
           
        },
        season: function() {

            return this.seasons.sort(function(obj1, obj2) {
                // Ascending: first age less than the previous
                return obj1.season_number - obj2.season_number;
            });


        },

        actors: function() {

            return this.actors.sort(function(obj1, obj2) {
                // Ascending: first age less than the previous
                return obj1.sort_order - obj2.sort_order;
            });

        },


    });
    
    Template.viewGig.events({
        
    'click #right-submission': function(template, event){
      
      console.log("Probation set2222!");
      
        
        
    },
    
    
    
    
    
    
});

    Template.shows.events({
        
    
    'click #right-submission': function(template, event){
      
      console.log("Probation set2222!");
      
        
        
    },

        'click .info': function(event, template) {

            notifications.on('message', function(message) {
                console.log(message);
            });

            Meteor.call('rescanShows', function(error, result) {

                if (error) {

                    console.log("There was an error with the Re-scan " + error);

                }
                else {

                    console.log("Finished Re-scan");

                }

            })


        },

        'click .scan': function(event, template) {
            event.preventDefault();


            var route = Router.current();
            
            var location = this.location;
            
            console.log(location);

            Meteor.call('guessShow3', route.params._id, location, function(error, result) { // Try to guess the title from the filename

                if (error) {

                    console.log("Guess Error!");

                }
                else {

                    console.log(result);


                }

            });
            
        },

        'click .remove': function(event, template) {
            
            var route = Router.current();

            Meteor.call('removeShows', route.params._id, function(error, result) {

                if (error) {

                    console.log("Remove Error!");

                }
                else {

                    toastr.success("Remove: ", "Removed the shows.");

                    console.log("All shows removed.");


                }

            });

        },

    });

    Template.home.events({

        'click .add-movie': function(event, template) {
            event.preventDefault();
            Moviess.insert({
                title: "Movie Title",
                description: "Movie description here."
            });
            $('.owl-carousel').trigger('destroy.owl.carousel');
            $('.owl-carousel').owlCarousel({
                items: 7
            });
        },
        'click .remove-movies': function(event, template) {
            event.preventDefault();
            Meteor.call('removeMovies');
            /*
        $('.owl-carousel').trigger('destroy.owl.carousel');
            $('.owl-carousel').owlCarousel({
    items:7
});
*/
        },

        'click .add-config': function(event, template) {
            event.preventDefault();

            Meteor.call('addConfig', url, function(error, result) {
                if (result) {
                    console.log(result);
                    Session.set("baseUrl", result);
                    console.log(base_url);
                }
                else {
                    console.log("Error with call to CONFIG!");
                }
            });
        },

        'click .remove-config': function(event, template) {
            event.preventDefault();
            Meteor.call('removeConfig', function(error, result) {
                if (result) {
                    console.log(result);
                }
                else {
                    console.log("Error with remove configs!!");
                }
            });
        },


    });

    


    Template.viewMoviePage.events({
        
        
        'click #remove': function(event, template) {
            
            
            Meteor.call('removeMovie', this._id, function(error, result) {
                  if (error) {
                      
                      console.log(error);
                      
                  } else {
                      
                      console.log("Removed movie.");
                      
                  }
                  
             });
            
            
            
        },

        'click .search': function(event, template) {
            notifications.on('message', function(message) {
                console.log(message);
            });
            var name = this.name;
            var id = this._id;
            console.log(name);
            console.log(id);

            Meteor.call('searchMovie', name, function(error, movie) { // Do a search on TMDB for movies matching the name

                if (error) {
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
                    console.log('Found ' + name);
                    var it = movie.results[0]; // Traverse only in the first array returned. I'd like to eventually setup my own equation to see whether the search result is actually the correct movie, but I'm relying on the TMDB search currently.

                    //var search = Moviess.findOne({name: name});
                    // console.log(search._id);
                    var overview = it.overview;
                    var release = it.release_date;
                    var runtime = it.runtime;
                    var poster_base = base_url;
                    var poster = it.poster_path;
                    var movie_id = it.id;


                    Meteor.call('updateMovie', id, name, overview, release, runtime, poster_base, poster, movie_id, function(error, movie) {

                        if (error) {
                            console.log("There was an error trying to call the update movie method.")
                        }
                        else {
                            console.log("name" + " has successfully been updated!");
                        }

                    });



                    console.log('Just finished ' + name);
                    console.log(it);



                }

            });

        },

    });

    Template.registerHelper("equals", function(a, b) {
        return (a === b);
    });
    
    Template.movies.events({

        'click .info': function(event, template) {

            notifications.on('message', function(message) {
                console.log(message);
            });

            Meteor.call('rescanShows', function(error, result) {

                if (error) {

                    console.log("There was an error with the Re-scan " + error);

                }
                else {

                    console.log("Finished Re-scan");

                }

            })


        },

        'click .scan': function(event, template) {
            event.preventDefault();


            var route = Router.current();
            
            var location = this.location;
            
            console.log(location);

            Meteor.call('guessIt2', route.params._id, location, function(error, result) { // Try to guess the title from the filename

                if (error) {

                    console.log("Guess Error!");

                }
                else {

                    console.log(result);


                }

            });
            
        },

        'click .remove': function(event, template) {
            
            var route = Router.current();

            Meteor.call('removeMovies', route.params._id, function(error, result) {

                if (error) {

                    console.log("Remove Error!");

                }
                else {

                    toastr.success("Removed the Movies.");

                    console.log("All movies removed.");


                }

            });

        },

    });




    Template.nav.onRendered(function() {
        $(document).foundation();
        $('ul.tabs').tabs();

    });
    
    
    
    
    
    Template.sidebar.onCreated(function() {
        
        Meteor.subscribe( 'sections', function(){
          $( ".sidebar .spinner" ).remove();
        });

    });
    
    var subTv =  // Defining a variable for the subscription to TV. Then I can reference later to stop it.
    
    Template.shows.onDestroyed(function() {
        
        console.log("Section destroyed.");
        subTv.stop();
        
        
    })
    
    
    Template.shows.onCreated(function() {
        
        var route = Router.current();
        
        console.log(route);
        
        subTv = Meteor.subscribe('tv', route.params._id);

    });
    
    Template.shows.helpers({

        content: function() {
            return Tv.find().fetch();
        },

    });



}

if (Meteor.isServer) {


    Images.allow({
        insert: function() {
            return true;
        },
        update: function() {
            return true;
        },
        remove: function() {
            return true;
        },
        download: function() {
            return true;
        }
    });


    var Future = Meteor.npmRequire('fibers/future');



    Meteor.publish('tv', function(section) {
        //this.unblock();
        return Tv.find({section: section}, {
            fields: {
                name: 1,
                _id: 1,
                poster: 1,
                section: 1,
            },
            sort: {
                name: 1
            }
        })
    });

    Meteor.publish('images', function() {
        //this.unblock();
        return Images.find({})
    });
    
    Meteor.publish('users', function() {
        //this.unblock();
        return Meteor.users.find({});
    });
    
    Meteor.publish('sections', function() {
        //this.unblock();
        return Sections.find({})
    });
    
    Meteor.publish('section', function(id) {
        //this.unblock();
        return Sections.find({_id: id})
    });

    Meteor.publish('tv_info', function(id, section) {
        //this.unblock();
        return Tv.find({
            _id: id,
            section: section
        });
    });

    Meteor.publish('movies', function(section) {
        //this.unblock();
        return Moviess.find({section: section}, {
            fields: {
                name: 1,
                _id: 1,
                poster: 1,
                location: 1,
                section: 1,
            },
            //limit: 20
        });
    });

    Meteor.publish('movie_info', function(id, section) {
        //this.unblock();
        return Moviess.find({
            _id: id,
            section: section,
        });
    });



    Meteor.publish('search', function(name) {
        check(name, String);
        var self = this;
        Meteor.call('actor', name, function(error, result) {
            if (result) {
                self.added("search", "mySearch", {
                    results: result
                });
                self.ready();
            }
            else {
                self.ready();
            }
        });
    });


    Meteor.publish('actor', function(name) {


        var future = new Future();
        var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

        MovieDB.searchPerson({
            query: name
        }, function(error, result) {

            if (error) {

                console.log(error);
                future.return(error);

            }
            else {

                console.log(result);
                future.return(result);
                this.ready();


            }

        });

        return future.wait();


    });



    Meteor.startup(function() {
        
        
         var future = new Future(),
             path = Meteor.npmRequire('path');
        
        
        // SERVER FUNCTIONS
        
        
                //////// SHOW FUNCTIONS
                
                
                        // Extract show name as best as possible

                    function showName(file, callback) {
    
                        var folder = file;
                        name = path.basename(file)
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
    
                                callback(null, result);
    
                            }
    
    
                        }))
                        
                    }
                
                //

                var episode_list = [];

                // Run a search for the show with the extracted guess
                
                    function showSearch(showNameResponse, name, location, callback) {
                        var walk = Meteor.npmRequire('walkdir');
                        var countrynames = Meteor.npmRequire('countrynames');
                        if (showNameResponse.title && showNameResponse.season && showNameResponse.episode) { // If all of these, I will assume it's an episode, and will do somethig with it later.
                            episode_list.push({name: name, season: showNameResponse.season, episode: showNameResponse.episode, location: location});
                            callback(null, "Just pushed " + name + " to the episode list because I found a title, season, and episode");
                        }
    
                        else if (!showNameResponse.episode) { // If there was no episode extracted
    
                            if (!showNameResponse.season) { // If there was no season extracted either, I'll assume it's a show folder
    
    
                                notifications.emit('message', "Found a show: " + name + " " + showNameResponse);
    
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
                                        callback(null, "Error searching " + series_name + ". " + error);
    
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
                                                callback(null, {
                                                    series: series_name,
                                                    notification: "Just added " + series_name
                                                });
    
                                            }))
    
                                        }
                                        
                                        else {
                                            
                                            //notifications.emit('message', name + " is already in the DB.");
                                            callback(null, {
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
                                        callback(null, "Error searching " + series_name + ". " + error);
    
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
                                            callback(null, {
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
    
                            callback(null, {
                                            notification: "Didn't know what to do with " + name + ". My guess: " 
                                        });
                                        notifications.emit('message', showNameResponse); 
    
    
                        }
    
    
    
                    }
                
                //




                var current_seasons = [];

                function pushSeasonNumber(season_number, callback) {

                    current_seasons.push(season_number);
                    callback(null, "done");


                }

                var seasonEps = "";


                function episodes(file, name, season, seasonNumber, callback) { // This function seems to be the one causing the most performance problems. But I'm also getting multiple resolved futures on the file function earlier.

                     
                    notifications.emit('message', "Current season for " + name);
                    notifications.emit('message', seasonNumber);
                    var folder = path.basename(encodeURIComponent(file)),
                        episodes = [],
                        walk = Meteor.npmRequire('walk'),
                        fs = Meteor.npmRequire('fs'),
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
                                                
                                                
                                                var episodeExist = episodes.filter(function( obj ) { // See if the episode already exists
                                                    if (obj.episode === episodeNumber) {
                                                        var sameLocation = obj.location.indexOf(location);
                                                        notifications.emit('message', "sameLocation");
                                                        notifications.emit('message', sameLocation);
                                                        if (sameLocation >= 0) { // Make sure not to add the same exact episode file.
                                                            notifications.emit('message', "Episode " + episodeNumber + " in this location is already in the database.");
                                                        } else {
                                                        obj.location.push(root + "/" + episodeName);
                                                        notifications.emit('message', "I just added another versions of episode " + episodeNumber);
                                                        notifications.emit('message', obj);
                                                        }
                                                        return obj;
                                                        
                                                    }
                                                })[ 0 ];
                                                notifications.emit('message', "episodeExist");
                                                notifications.emit('message', episodeExist);
                                                
                                                if (!episodeExist) {
                                                    
                                                    var episode = {
                                                        location: [root + "/" + episodeName],
                                                        episode: result.episode
                                                    }
                                                    
                                                    episodes.push(episode);
                                                    
                                                }
                                                
                                        } else {
                                            
                                            var episodeExist = episodes.filter(function( obj ) { // See if the episode already exists
                                                    if (obj.episode === episodeNumber) {
                                                        var sameLocation = obj.location.indexOf(location);
                                                        notifications.emit('message', "sameLocation");
                                                        notifications.emit('message', sameLocation);
                                                        if (sameLocation >= 0) { // Make sure not to add the same exact episode file.
                                                            notifications.emit('message', "Episode " + episodeNumber + " in this location is already in the database.");
                                                        } else {
                                                        obj.location.push(root + "/" + episodeName);
                                                        notifications.emit('message', "I just added another versions of episode " + episodeNumber);
                                                        notifications.emit('message', obj);
                                                        }
                                                        return obj;
                                                        
                                                    }
                                                })[ 0 ];
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


                                    notifications.emit('message', "Finished season " + seasonNumber + " of " +  name + " Here's all of the episodes for the season:");
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
                                        if (find_show.seasons.length > 0)  {

                                        find_show.seasons.forEach(function(file, index, array) {

                                            var pushSeasonNumberWrap = Async.wrap(pushSeasonNumber);

                                            var response2 = pushSeasonNumberWrap(file.season_number);

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
                                            callback(null, "Looks like season " + seasonNumber + " of " + name + " already exists.");
                                            





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

                                            callback(null, "Added episodes to " + name + " season " + seasonNumber);

                                        }
                                        else {
                                            
                                        }

                                    }
                                    else {
                                        callback(null, "No show found in DB for " + name);
                                    }



                                }));












                         



                }



                function directoryRecur(directory, name, seasons, callback) {
                    
                    var walk = Meteor.npmRequire('walkdir');
                    var emitter2 = walk(directory);
                    
                    notifications.emit('message', "seasons test");
                    notifications.emit('message', seasons);

                    //var seasons = [];

                    var more = [];
                    var episode_array = [];
                    var directories = [];
                    //var season = "";

                    emitter2.on('directory', Meteor.bindEnvironment(function(dir, stat) {

                        directories.push(dir);




                    }))




                    emitter2.on('end', Meteor.bindEnvironment(function(path1, stat) {

                        directories.forEach(function(file, index, array) {

                            notifications.emit('message', "Checking the folder " + file);
                            
                            var folder = path.basename(file);
                            
                            
                            Meteor.call('showName2', folder, Meteor.bindEnvironment(function(error, result) { // Check the folder name to make sure it's a season.

                                if (error) {
        
                                    notifications.emit('message', error);
                                    callback(null, error);
        
                                }
                                else {
                                    
                                    
                                    if (result.season && !result.episode) { // If there's a season, but no episode

                                
                                        var season = result.season;
                                        
                                        if(season && seasons) { // I need to get the correct logic here to only run when there are seasons. No point trying to filter through nothing, and spitting out undefined errors.
                                            
                                            notifications.emit('message', "seasons test");
                                        notifications.emit('message', seasons);
                                        
                                        var seasonExist = seasons.filter(function( obj ) { // Look for a season with the current season number.
                                            return +obj.season_number === +season;
                                        })[ 0 ];
                                        
                                        }
                                        
                                        
                                        /*
                                        var check = seasons[seasonIndex].map(function ( obj ) {
                                            return obj.episode === result.episode;
                                        })[0]
                                        */
                                        
                                        
                                        notifications.emit('message', "check test");
                                        notifications.emit('message', season);
                                        notifications.emit('message', seasonExist);
                                            
                                        var episodesWrap = Async.wrap(episodes);
    
                                        var response = episodesWrap(file, name, seasonExist, season);
            
                                        notifications.emit('message', response);
                                    
                                    
                                    
                                    
                                    }
                                    
                                    
                                    
                                    
                                    
                                }
                                
                                
                            }))
                            
                            
                            
                            
                            
                            
                            
                            
                            

                            




                        });
                        callback(null, "Done with " + name);




                    }));




                }
                
                
                
                
                
                
                
                
                
                ////////
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        ////////////////////////////////////////////
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        //// Watch current folders
        notifications.permissions.read(function(userId, eventName) {
                    return true;
                });
        
        
        var allSections = Sections.find().fetch();
        
        var chokidar = Meteor.npmRequire('chokidar');
        
        var newFolder = false;
        
        var folderRemoved = false;
        
        var folderWatch = [];
        
        console.log(allSections);
        
        allSections.forEach(Meteor.bindEnvironment(function(file) {
            
                // Push the folder locations to an array, and then do the folder watch on that array.
                
                /*
                I also need to figure out what to do when the program isn't running. If it's not running, and then new movies/shows are put in the directory, the folder watch
                won't know. I'll need to run an intial startup search to check for changes or something.
                
                
                */
            
            var watcher = chokidar.watch(file.location, {
              ignored: /[\/\\]\./,
              persistent: true,
              ignoreInitial: true,
              awaitWriteFinish: true,
            });
          
          watcher.on('add', Meteor.bindEnvironment(function(path) {
              
              // Likely have to do a check here to check the path to make sure it's just a file and not a file in a new folder, because it sets off file first.
              // Probably do a regex to check if the parent directory of the file is the directory being watched, and not a new directory where the event hasn't gone off yet.
              
              
              /*
              SINCE THERE'S THE POSSIBILITY OF MULTIPLE FOLDERS/FILES BEING ADDED AT THE SAME TIME, I'LL HAVE TO FIGURE SOMETHING OUT. MAYBE ON FOLDER-ADD, PUSH THE PATH INTO AN
              ARRAY, AND THEN CHECK IF THE FILE IS IN THE DIRECTORY USING A REGEX FUNCTION.
              
              FOR INSTACNE: A FILE MIGHT BE ADDED AT 'HOME/COLT/PLEX/TEST_SEARCH/NEW_FOLDER/MOVIE.MKV', AND 'NEW_FOLDER' IS A NEW FOLDER. I WOULD ADD THE FOLDER PATH ON FOLDER-ADD
              TO AN ARRAY, AND EXTRACT THE STRING AFTER THE LAST SLASH, THEN CHECK TO SEE IF THAT'S THE PARENT FOLDER OF THE FILE.
              
              */
           if (newFolder) { // If the file is also inside a new folder
               
               console.log("IT LOOKS LIKE " + path + " IS INSIDE A NEW FOLDER, SO I WON'T DO ANYTHING WITH THIS FILE.");
               
               
           } else { // If it's just a new file.
           
           
              
              if (file.format === "movies") {
                  
                  console.log("Movie " + path + " has been added to " + file.location);
                  
              } else if (file.format === "shows") {
                  
                  console.log("Episode " + path + " has been added to " + file.location);
                  
              }
              
          }
              
            
          }));
          watcher.on('change', Meteor.bindEnvironment(function(path) {
              
            console.log("File " + path + " has been changed in " + file.location);
          }));
          watcher.on('unlink', Meteor.bindEnvironment(function(path) {
              
              if (folderRemoved) {
                  console.log("IT LOOKS LIKE " + path + " MIGHT BE INSIDE A FOLDER THAT'S BEING REMOVED.")
              } else {
              
              if (file.format === "movies") {
                  
                  console.log("Movie " + path + " has been removed from " + file.location);
                  
              } else if (file.format === "shows") {
                  
                  console.log("Show " + path + " has been removed from " + file.location);
                  
              }
              
              
          }
              
            
          }));
          watcher.on('addDir', Meteor.bindEnvironment(function(path) {
              
              newFolder = true;
              
              if (file.format === "movies") {
                  
                  Meteor.call('guessIt3', file._id, path, Meteor.bindEnvironment(function(error, result) {

                        if (error) {
        
                            console.log("Guess Error!");
        
                        }
                        else {
        
        
                        }
        
                    }));
                  
                  newFolder = false;
                  
                  console.log("Movie folder " + path + " has been added to " + file.location);
                  
              } else if (file.format === "shows") {
                  
                  
                  newFolder = false;
                  console.log("Show folder " + path + " has been added to " + file.location);
                  
              }
              
            
          }));
          watcher.on('unlinkDir', Meteor.bindEnvironment(function(path) {
              
              folderRemoved = true;
              
              function escapeRegExp(str) { // Escaping for regex string
                  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                }
              
              if (file.format === "movies") { // If the section is for movies
                  
                  
                  var pathRegex = escapeRegExp(path);
                  //var regex = "/"+pathRegex+"/";
                  //var find = path + ".*";
                  var movieFind = Moviess.find({location: new RegExp(pathRegex)}).fetch();
                  notifications.emit('message', 'movieFind');
                  notifications.emit('message', movieFind);
                  
                  movieFind.forEach(function(doc) {
                        
                        if (doc.location.length === 1) { // If there's only 1 file, then remove the whole thing.
                            
                            Moviess.remove({_id: doc._id},
                                function(err, res) {
                                    if (err) {
                                        throw err;
                                    }
                                    else {
                                        notifications.emit('message', "Removed all references to " + path);
                                        console.log("Removed all references to " + path);
                                    }
                                });
                            
                        } else { // If multiple files, then just pull the matching one.
                            
                            
                            Moviess.update({
                                _id: doc._id
                            }, 
                            
                            {
                                 $pull : {
                                    location : new RegExp(pathRegex)
                                    
                                }
                                
                            },
                            { multi: true },
                             function(err, res) {
                                if (err) {
                                    throw err;
                                }
                                else {
                                    
                                    notifications.emit('message', "Removed all references to " + path);
                                    console.log("Removed all references to " + path);
                                    
                                }
                            });
                            
                            
                            
                        }
                        
                    });
                    
                    notifications.emit('message', "Movie folder " + path + " has been removed from " + file.location);
                    console.log("Movie folder " + path + " has been removed from " + file.location);
                  
                  folderRemoved = false;
                  
              } else if (file.format === "shows") {
                  
                  // I have to do a check here to see if the folder is a season folder, show folder, or episode folder, and remove the correct folder from the DB.
                  
                  folderRemoved = false;
                  console.log("Show folder " + path + " has been removed " + file.location);
                  
              }
              
          }));
          watcher.on('error', Meteor.bindEnvironment(function(path) {
              
            console.log("Error with " + path + " in " + file.location);
          }));
          watcher.on('ready', Meteor.bindEnvironment(function(path) {
              
            console.log("Initial read of " + file.location + " complete. Ready for changes.");
          }));
        
        
        }));
        
        
        
        
        Meteor.methods({
            
            removeUsers: function() {
                
                Meteor.users.remove({},
                    function(err, res) {
                        if (err) {
                            throw err;
                        }
                        else {
                            return "Removed the users.";
                        }
                    });
                
            },
            
            
            removeMovie: function(id) {
                
                Moviess.remove({_id: id},
                    function(err, res) {
                        if (err) {
                            throw err;
                        }
                        else {
                            return "Removed the movie.";
                        }
                    });
                
            },
            
            
            
            
            
            
            
            fileDir2: function() {
                var fs = Meteor.npmRequire('fs');
                var fileDirVar = Meteor.wrapAsync(

                    fs.readdir("/", function(err, files) {
                        if (err) {
                            return (err);
                        }
                        else {
                            files.forEach(function(file) {
                                return (file);
                            });
                        }
                    })

                );


                return fileDirVar;
            },
            
            
            addSection: function(name, location, format) {
                
                var insert = Sections.insert({
                    name: name,
                    location: location,
                    format: format,
                });
                
                return insert;
                
                
                
            },
            
            editSection: function(name, location, format, id) {
                
                Sections.update({
                    _id: id,
                },
                {
                    name: name,
                    location: location,
                    format: format,
                });
                
                
                
            },
            
            removeSections: function() {
                
                
                Sections.remove({});
                
                
                
            },
            
            removeSection: function(id) {
                
                var section = Sections.findOne({_id: id});
                
                
                
                if (section.format === "movies") {
                    
                    Moviess.remove({section: id});
                    
                } else if (section.format === "shows") {
                    
                    Tv.remove({section: id});
                    
                } else {
                    
                }
                
                Sections.remove(section);
                
                
                
                
                
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
                fetch.forEach(function(file, index, array) { // This runs a foreach to go through every movie in the movie collection.

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
                fetch.forEach(function(file, index, array) {



                    name = file.name;

                    var id = file.show_id;

                    var new_id = file._id;

                    if (run >= 20) {

                        run = 0;
                        notifications.emit('message', 'YOU HIT THE LIMIT FOR TVDB');
                        Meteor._sleepForMs(18000);
                        notifications.emit('message', 'THE LIMIT IS UP');

                        file.seasons.forEach(function(file, index, array) {

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

                        file.seasons.forEach(function(file, index, array) {

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

            fileDir3: function() {

                var fs = Meteor.npmRequire('fs');

                var traverseFileSystem = function(currentPath) {
                    console.log(currentPath);
                    var files = fs.readdirSync(currentPath);
                    for (var i in files) {
                        var currentFile = currentPath + '/' + files[i];
                        var stats = fs.statSync(currentFile);
                        if (stats.isFile()) {
                            console.log(currentFile);
                        }
                        else if (stats.isDirectory()) {
                            traverseFileSystem(currentFile);
                        }
                    }
                };
                traverseFileSystem('/');

                return traverseFileSystem;

            },

            DirList: function() {
                var fs = Meteor.npmRequire('fs');
                root = "/home/colt/Plex/test_search/";
                var files = fs.readdirSync(root);

                return files;

            },


            fileDir: function() {
                var fs = Meteor.npmRequire('fs');

                console.log("Going to read directory /");
                fs.readdir("/", function(err, files) {
                    if (err) {
                        return (err);
                    }
                    else {
                        Session.set("dir_files", files + "/");
                    }
                });




                /*

                var fs = require("fs");

                console.log("Going to read directory /tmp");
                fs.readdir("/tmp/",function(err, files){
                   if (err) {
                       return console.error(err);
                   }
                   files.forEach( function (file){
                       console.log( file );
                   });
                });

                */


            },

            searchMovie: function(name) {
                var future = new Future();
                var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

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


            searchPerson: function(name) {
                var future = new Future();
                var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

                MovieDB.searchPerson({
                    query: name
                }, function(error, result) {

                    if (error) {

                        console.log(error);
                        future.return(error);

                    }
                    else {

                        //console.log(result.results[0]);
                        future.return(result);


                    }

                });

                return future.wait();





            },




            searchShow: function(name) {
                var future = new Future();
                var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

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
                        
                        MovieDB.tvInfo({id: result.results[0].id}, function(err, res){
                            
                            if (err) {

                                future.return(error);
        
                            }
                            else {
                                
                                if (res.status == "Returning Series") {
                                    
                                    notifications.emit('message', name + " is a returning series.");
                                    
                                    MovieDB.tvSeasonInfo({id: res.id, season_number: res.number_of_seasons}, function(err, res){
                            
                                        if (err) {
            
                                            future.return(error);
                    
                                        }
                                        else {
                                    
                                            future.return(res);
                                    
                                        }
                                        
                                    });
                                    
                                    
                                    
                                    
                                } else {
                                    future.return(res);
                                }
                            
                            }
                        });
                        
                        
                        
                        
                        
                        
                        

                        

                    } else {
                        future.return("Looks like I couldn't find any info for the show on TVDB.");
                        throw "Looks like I couldn't find any info for the show on TVDB.";
                    }
                    }

                });

                return future.wait();





            },


            showInfo: function(id, season) {
                var future = new Future();
                var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

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


                return Moviess.find().fetch();

            },


            movieInfo: function(id) {
                var future = new Future();
                var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');


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

            movieCredits: function(id) {
                var future = new Future();
                var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');


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




            add_movies: function(name, old_name, overview, release, runtime, poster, poster_base) {
                Moviess.insert({
                    name: name,
                    overview: overview,
                    release: release,
                    runtime: runtime,
                    old_name: old_name,
                    poster: poster_base + poster,
                });

                return Moviess.find().fetch();

            },

            streamMp4: function(path) {
                
                this.unblock();

                notifications.permissions.read(function(userId, eventName) {
                    return true;
                });



                var http = Meteor.npmRequire('http');
                var fs = Meteor.npmRequire('fs');
                var util = Meteor.npmRequire('util');
                var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
                var Transcoder = Meteor.npmRequire('stream-transcoder');
                var portfinder = Meteor.npmRequire('portfinder');
                var future = new Future();


                var pathToMovie = '/var/home/colt/Plex/Alien (1979)1080p/Alien19791080p.mkv';




ffmpeg.ffprobe(path, function(err, metadata) {
                            
                            
                            if (err) {
                              notifications.emit('message', 'Video error');  
                            }
                            else {
                                
          /*                    
                                
                                    var proc = ffmpeg(path)
  // set video bitrate
  .videoBitrate(1024)
  // set h264 preset
  .addOption('-preset ultrafast')
  // set target codec
  .videoCodec('libx264')
  // set audio bitrate
  .audioBitrate('128k')
  // set audio codec
  .audioCodec('libfdk_aac')
  // set number of audio channels
  .audioChannels(2)
  // set hls segments time
  .addOption('-hls_time', 10)
  // include all the segments in the list
  .addOption('-hls_list_size',0)
  // setup event handlers
  .on('end', function() {
    console.log('file has been converted succesfully');
  })
  .on('error', function(err, stdout, stderr) {
    console.log('an error happened: ' + err.message);
                                console.log('ffmpeg stdout: ' + stdout);
                                console.log('ffmpeg stderr: ' + stderr);
  })
  // save to file
  .save('/var/home/colt/plesk_hosted/htpc_meteor/public/stream/stream.m3u8');
  */
  
                                
                           

               portfinder.getPort(function(err, port) {


                http.createServer(function(req, res) {
                        
                        

                        //notifications.emit('stream', metadata1);
                        //var duration = metadata1.format.duration;
                        //var size = metadata1.format.size;
                        console.log("encoding movie", path);
                        notifications.emit('message', metadata);

                        /*  

                        Ultimately must find the best way to stream transcoding video to html5 video tag. Don't use Adobe Flash stuff, obviously. See if there's a
                        better option than what I put below.

                        I currently have it working, it's just that there is no way to seek. The way I've been trying to get around this is by pulling the duration
                        from the video, and then sending it to the browser in the header request sent to the client. I just don't know how to correctly write this.

                        After that, I will then need to start an FFMPEG process for whenever the client seeks anywhere in the video. It will need to pull the selected
                        time from  the video player, and seek to that time in FFMPEG. Also, close the previous FFMPEG process. 

                        Then the video player will need to change its source to that new video server location.


                           res.writeHead(206, { // NOTE: a partial http response
                            'Content-Type': 'video/webm',
                        'Content-Length': 10000,
                        'X-Content-Duration': 10000,
                        'Content-Duration': 10000
                        });
                        */
                        
                        /*
                        res.writeHead({
                            'X-Content-Duration' : metadata.format.duration, //in seconds
                            'Content-Duration': metadata.format.duration, //in seconds
                            'Content-Length': metadata.format.size,
        'Content-Type'       : 'video/mp4'
    });
    
    */
    
    /*
    var range = req.headers.range
    , parts = range.replace(/bytes=/, "").split("-")
    , partialstart = parts[0]
    , partialend = parts[1]
    , start = parseInt(partialstart, 10)
    , end = partialend ? parseInt(partialend, 10) : metadata.format.size-1
    , chunksize = (end-start)+1
    
    res.writeHead(206
    , { 'Content-Range': 'bytes ' + start + '-' + end + '/' + metadata.format.size
    , 'Accept-Ranges': 'bytes', 'Content-Length': chunksize
    , 'Transfer-Encoding': 'chunked'
    , 'Content-Type': 'video/mp4'
    })
    
    console.log(end);
    console.log("PLAYING MP4");
    */
    

var stream  = fs.createWriteStream('/var/home/colt/plesk_hosted/htpc_meteor/public/stream/out.mp4');
                        ffmpeg(path)
                        
                        /*
                        
                            .withVideoCodec('libvpx')
  .addOptions(['-qmin 10', '-qmax 42', '-quality good', '-crf 20', '-cpu-used -6', '-threads 0', '-f webm', '-deadline realtime'])
  .withVideoBitrate(2200)
  .withAudioCodec('libvorbis')
  .audioBitrate('128k')
  .audioChannels(2)
  .fps(24)
    .withSize('1280x720')
    .format('webm')
    */
    
    
    /*
    .withVideoCodec('libx264')
                            .addOptions([])
                            //.withVideoBitrate("1024k")
                            .withAudioCodec('libfdk_aac')
                            //.fps(25)
                            //.withSize('1280x720')
                            .format('matroska')
                            
                           */ 
                           /*
                            
                            .videoBitrate(1024)
  // set h264 preset
  .addOption('-segment_list /var/home/colt/plesk_hosted/htpc_meteor/public/stream.m3u8', '-hls_flags delete_segments')
  // set target codec
  .videoCodec('libx264')
  // set audio bitrate
  .audioBitrate('128k')
  // set audio codec
  .audioCodec('libfaac')
  // set number of audio channels
  .audioChannels(2)
  // set hls segments time
  .addOption('-hls_time', 10)
  // include all the segments in the list
  .addOption('-hls_list_size',10)
  .format('ts')
          
          */                  
                            
                            
                           
    //.pipe(res, { end: true })
    .withVideoCodec('libx264')
                            .addOptions(['-crf 24', '-movflags frag_keyframe+empty_moov', '-preset ultrafast']) // -movflags frag_keyframe+empty_moov   -movflags +faststart    Might use a different flag to move the metadata to the front.
                            .withVideoBitrate(2200)
                            .withAudioCodec('libfdk_aac')
                            .audioBitrate('128k')
  .audioChannels(2)
                            .fps(24)
                            .withSize('1280x720')
                            .format('mp4')
                            
                            
                            /*
                            .output('/var/home/colt/plesk_hosted/htpc_meteor/public/stream/stream.m3u8')
                            .videoBitrate(1024)
                              // set h264 preset
                              .addOptions(['-preset ultrafast', '-hls_time 10', '-hls_list_size 0', '-hls_flags delete_segments'])
                              // set target codec
                              .videoCodec('libx264')
                              // set audio bitrate
                              .audioBitrate('128k')
                              // set audio codec
                              .audioCodec('libfdk_aac')
                              // set number of audio channels
                              .audioChannels(2)
                              //.format('ts')
                            */
                            
    
    
    
                            
                            
                            /*
                            .withVideoCodec('libx264')
                            .addOptions(['-crf 22', '-movflags faststart'])
                            .withVideoBitrate("1024k")
                            .withAudioCodec('aac')
                            .fps(25)
                            .withSize('1280x720')
                            .format('mp4')
                            */
                            
                            .on('error', function(err, stdout, stderr) {
                                console.log('an error happened: ' + err.message);
                                console.log('ffmpeg stdout: ' + stdout);
                                console.log('ffmpeg stderr: ' + stderr);
                            })
                            .on('end', function() {
                                console.log('Processing finished !');
                            })
                            .on('progress', function(progress) {
                                console.log('Processing: ' + progress.percent + '% done');
                            })
                            .pipe(res, {
                                end: true
                            });
                        
                    
                    }).listen(port);
                    console.log("video stream running on port: " + port);
                    future.return({port:port, duration: metadata.format.duration});
                    //future.return({port:port, duration: metadata.format.duration});
                    

                });
                
                
                
                            }
})


                return future.wait();


                /*	    

                http.createServer(function(req, res) {
                  // The filename is simple the local directory and tacks on the requested url
                  var filename = "/home/colt/Plex/movies/Zoolander.2001.1080p.BluRay.AC3.DTS.ML.x264-HDC.cp(tt0196229)/Zoolander.2001.1080p.BluRay.AC3.DTS.ML.x264-HDC.mkv";

                  // This line opens the file as a readable stream
                  var readStream = fs.createReadStream(filename);

                  // This will wait until we know the readable stream is actually valid before piping
                  readStream.on('open', function () {
                    // This just pipes the read stream to the response object (which goes to the client)
                    readStream.pipe(res);
                    console.log("piping");
                  });

                  // This catches any errors that happen while creating the readable stream (usually invalid names)
                  readStream.on('error', function(err) {
                    res.end(err);
                    console.log(err);
                  });
                }).listen(8080);
                console.log("listening!")






                // create the target stream (can be any WritableStream)
                var stream = fs.createWriteStream('/home/colt/Plex/movies/White.House.Down.2013.1080p.BluRay.DTS.x264-CyTSuNee/White.House.Down.2013.1080p.BluRay.DTS.x264-CyTSuNee.mkv')

                // make sure you set the correct path to your video file
                var proc = ffmpeg(stream)
                  // use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
                  .preset('flashvideo')
                  // setup event handlers
                  .on('end', function() {
                    console.log('file has been converted succesfully');
                  })
                  .on('error', function(err, stdout, stderr) {
                    console.log('Error: ' + err.message);
                    console.log('ffmpeg output:\n' + stdout);
                    console.log('ffmpeg stderr:\n' + stderr);
                  })
                  // save to stream
                  .pipe(stream, {end:true}); //end = true, close output stream after writing




                */



            },
            
            
            
                        streamWebm: function(path) {
                
                this.unblock();

                notifications.permissions.read(function(userId, eventName) {
                    return true;
                });



                var http = Meteor.npmRequire('http');
                var fs = Meteor.npmRequire('fs');
                var util = Meteor.npmRequire('util');
                var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
                var Transcoder = Meteor.npmRequire('stream-transcoder');
                var portfinder = Meteor.npmRequire('portfinder');
                var future = new Future();


                var pathToMovie = '/var/home/colt/Plex/Alien (1979)1080p/Alien19791080p.mkv';




ffmpeg.ffprobe(path, function(err, metadata) {
                            
                            
                            if (err) {
                              notifications.emit('message', 'Video error');  
                            }
                            else {
                                
          /*                    
                                
                                    var proc = ffmpeg(path)
  // set video bitrate
  .videoBitrate(1024)
  // set h264 preset
  .addOption('-preset ultrafast')
  // set target codec
  .videoCodec('libx264')
  // set audio bitrate
  .audioBitrate('128k')
  // set audio codec
  .audioCodec('libfdk_aac')
  // set number of audio channels
  .audioChannels(2)
  // set hls segments time
  .addOption('-hls_time', 10)
  // include all the segments in the list
  .addOption('-hls_list_size',0)
  // setup event handlers
  .on('end', function() {
    console.log('file has been converted succesfully');
  })
  .on('error', function(err, stdout, stderr) {
    console.log('an error happened: ' + err.message);
                                console.log('ffmpeg stdout: ' + stdout);
                                console.log('ffmpeg stderr: ' + stderr);
  })
  // save to file
  .save('/var/home/colt/plesk_hosted/htpc_meteor/public/stream/stream.m3u8');
  */
  
                                
                           

               portfinder.getPort(function(err, port) {


                http.createServer(function(req, res) {
                        
                        

                        //notifications.emit('stream', metadata1);
                        //var duration = metadata1.format.duration;
                        //var size = metadata1.format.size;
                        console.log("encoding movie", path);
                        notifications.emit('message', metadata);

                        /*  

                        Ultimately must find the best way to stream transcoding video to html5 video tag. Don't use Adobe Flash stuff, obviously. See if there's a
                        better option than what I put below.

                        I currently have it working, it's just that there is no way to seek. The way I've been trying to get around this is by pulling the duration
                        from the video, and then sending it to the browser in the header request sent to the client. I just don't know how to correctly write this.

                        After that, I will then need to start an FFMPEG process for whenever the client seeks anywhere in the video. It will need to pull the selected
                        time from  the video player, and seek to that time in FFMPEG. Also, close the previous FFMPEG process. 

                        Then the video player will need to change its source to that new video server location.


                           res.writeHead(206, { // NOTE: a partial http response
                            'Content-Type': 'video/webm',
                        'Content-Length': 10000,
                        'X-Content-Duration': 10000,
                        'Content-Duration': 10000
                        });
                        */
                        
                        /*
                        res.writeHead({
                            'X-Content-Duration' : metadata.format.duration, //in seconds
                            'Content-Duration': metadata.format.duration, //in seconds
                            'Content-Length': metadata.format.size,
        'Content-Type'       : 'video/mp4'
    });
    
    */
    /*
    var range = req.headers.range
    , parts = range.replace(/bytes=/, "").split("-")
    , partialstart = parts[0]
    , partialend = parts[1]
    , start = parseInt(partialstart, 10)
    , end = partialend ? parseInt(partialend, 10) : metadata.format.size-1
    , chunksize = (end-start)+1
    
    res.writeHead(206
    , { 'Content-Range': 'bytes ' + start + '-' + end + '/' + metadata.format.size
    , 'Accept-Ranges': 'bytes', 'Content-Length': chunksize
    , 'Transfer-Encoding': 'chunked'
    , 'Content-Type': 'video/webm'
    })
    
    console.log(end);
    
    */
    
    /*
     res.writeHead(206, { 
    'Content-Type': 'video/webm',
    'Content-Length': metadata.format.size,
    "Content-Range": "bytes 0-"+end+"/"+metadata.format.size,
    "Accept-Ranges": "0-"+metadata.format.size,
     });
     */

var stream  = fs.createWriteStream('/var/home/colt/plesk_hosted/htpc_meteor/public/stream/out.mp4');
                        ffmpeg(path)
                        
                        
                        
                            .withVideoCodec('libvpx')
  .addOptions(['-qmin 10', '-qmax 42', '-quality good', '-crf 20', '-cpu-used -6', '-threads 0', '-f webm', '-deadline realtime'])
  .withVideoBitrate(2200)
  .withAudioCodec('libvorbis')
  .audioBitrate('128k')
  .audioChannels(2)
  .fps(24)
    .withSize('1280x720')
    .format('webm')
    
    
    
    /*
    .withVideoCodec('libx264')
                            .addOptions([])
                            //.withVideoBitrate("1024k")
                            .withAudioCodec('libfdk_aac')
                            //.fps(25)
                            //.withSize('1280x720')
                            .format('matroska')
                            
                           */ 
                           /*
                            
                            .videoBitrate(1024)
  // set h264 preset
  .addOption('-segment_list /var/home/colt/plesk_hosted/htpc_meteor/public/stream.m3u8', '-hls_flags delete_segments')
  // set target codec
  .videoCodec('libx264')
  // set audio bitrate
  .audioBitrate('128k')
  // set audio codec
  .audioCodec('libfaac')
  // set number of audio channels
  .audioChannels(2)
  // set hls segments time
  .addOption('-hls_time', 10)
  // include all the segments in the list
  .addOption('-hls_list_size',10)
  .format('ts')
          
          */                  
                            
                            
                           
    //.pipe(res, { end: true })
    /*
    .withVideoCodec('libx264')
                            .addOptions(['-crf 24', '-movflags frag_keyframe', '-preset ultrafast']) // -movflags frag_keyframe+empty_moov   -movflags +faststart    Might use a different flag to move the metadata to the front.
                            .withVideoBitrate(2000)
                            .withAudioCodec('libfdk_aac')
                            .audioBitrate('128k')
  .audioChannels(2)
                            .fps(24)
                            .withSize('1280x720')
                            .format('mp4')
                            */
                            
                            
                            /*
                            .output('/var/home/colt/plesk_hosted/htpc_meteor/public/stream/stream.m3u8')
                            .videoBitrate(1024)
                              // set h264 preset
                              .addOptions(['-preset ultrafast', '-hls_time 10', '-hls_list_size 0', '-hls_flags delete_segments'])
                              // set target codec
                              .videoCodec('libx264')
                              // set audio bitrate
                              .audioBitrate('128k')
                              // set audio codec
                              .audioCodec('libfdk_aac')
                              // set number of audio channels
                              .audioChannels(2)
                              //.format('ts')
                            */
                            
    
    
    
                            
                            
                            /*
                            .withVideoCodec('libx264')
                            .addOptions(['-crf 22', '-movflags faststart'])
                            .withVideoBitrate("1024k")
                            .withAudioCodec('aac')
                            .fps(25)
                            .withSize('1280x720')
                            .format('mp4')
                            */
                            
                            .on('error', function(err, stdout, stderr) {
                                console.log('an error happened: ' + err.message);
                                console.log('ffmpeg stdout: ' + stdout);
                                console.log('ffmpeg stderr: ' + stderr);
                            })
                            .on('end', function() {
                                console.log('Processing finished !');
                            })
                            .on('progress', function(progress) {
                                console.log('Processing: ' + progress.percent + '% done');
                            })
                            .pipe(res, {
                                end: true
                            });
                        
                    
                    }).listen(port);
                    console.log("video stream running on port: " + port);
                    future.return({port:port, duration: metadata.format.duration});
                    //future.return({port:port, duration: metadata.format.duration});
                    

                });
                
                
                
                            }
})


                return future.wait();


                /*	    

                http.createServer(function(req, res) {
                  // The filename is simple the local directory and tacks on the requested url
                  var filename = "/home/colt/Plex/movies/Zoolander.2001.1080p.BluRay.AC3.DTS.ML.x264-HDC.cp(tt0196229)/Zoolander.2001.1080p.BluRay.AC3.DTS.ML.x264-HDC.mkv";

                  // This line opens the file as a readable stream
                  var readStream = fs.createReadStream(filename);

                  // This will wait until we know the readable stream is actually valid before piping
                  readStream.on('open', function () {
                    // This just pipes the read stream to the response object (which goes to the client)
                    readStream.pipe(res);
                    console.log("piping");
                  });

                  // This catches any errors that happen while creating the readable stream (usually invalid names)
                  readStream.on('error', function(err) {
                    res.end(err);
                    console.log(err);
                  });
                }).listen(8080);
                console.log("listening!")






                // create the target stream (can be any WritableStream)
                var stream = fs.createWriteStream('/home/colt/Plex/movies/White.House.Down.2013.1080p.BluRay.DTS.x264-CyTSuNee/White.House.Down.2013.1080p.BluRay.DTS.x264-CyTSuNee.mkv')

                // make sure you set the correct path to your video file
                var proc = ffmpeg(stream)
                  // use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
                  .preset('flashvideo')
                  // setup event handlers
                  .on('end', function() {
                    console.log('file has been converted succesfully');
                  })
                  .on('error', function(err, stdout, stderr) {
                    console.log('Error: ' + err.message);
                    console.log('ffmpeg output:\n' + stdout);
                    console.log('ffmpeg stderr:\n' + stderr);
                  })
                  // save to stream
                  .pipe(stream, {end:true}); //end = true, close output stream after writing




                */



            },               

            
            
            
            streamSeek: function(path, seek) {
                
                this.unblock();

                notifications.permissions.read(function(userId, eventName) {
                    return true;
                });



                var http = Meteor.npmRequire('http');
                var fs = Meteor.npmRequire('fs');
                var util = Meteor.npmRequire('util');
                var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
                var Transcoder = Meteor.npmRequire('stream-transcoder');
                var portfinder = Meteor.npmRequire('portfinder');
                var future = new Future();


                var pathToMovie = '/var/home/colt/Plex/Alien (1979)1080p/Alien19791080p.mkv';




ffmpeg.ffprobe(path, function(err, metadata) {
                            
                            
                            if (err) {
                              notifications.emit('message', 'Video error');  
                            }
                            else {

                portfinder.getPort(function(err, port) {


                    http.createServer(function(req, res) {
                        
                        

                        //notifications.emit('stream', metadata1);
                        //var duration = metadata1.format.duration;
                        //var size = metadata1.format.size;
                        console.log("encoding movie", path);
                        notifications.emit('message', metadata);

                        /*  

                        Ultimately must find the best way to stream transcoding video to html5 video tag. Don't use Adobe Flash stuff, obviously. See if there's a
                        better option than what I put below.

                        I currently have it working, it's just that there is no way to seek. The way I've been trying to get around this is by pulling the duration
                        from the video, and then sending it to the browser in the header request sent to the client. I just don't know how to correctly write this.

                        After that, I will then need to start an FFMPEG process for whenever the client seeks anywhere in the video. It will need to pull the selected
                        time from  the video player, and seek to that time in FFMPEG. Also, close the previous FFMPEG process. 

                        Then the video player will need to change its source to that new video server location.


                           res.writeHead(206, { // NOTE: a partial http response
                            'Content-Type': 'video/webm',
                        'Content-Length': 10000,
                        'X-Content-Duration': 10000,
                        'Content-Duration': 10000
                        });
                        */
                        
                        /*
                        res.writeHead({
                            'X-Content-Duration' : metadata.format.duration, //in seconds
                            'Content-Duration': metadata.format.duration, //in seconds
                            'Content-Length': metadata.format.size,
        'Content-Type'       : 'video/webm'
    });
    */
    


                        ffmpeg(path)
                        
                        
                            .withVideoCodec('libvpx')
  .addOptions(['-qmin 0', '-qmax 50', '-crf 5', '-quality good', '-cpu-used -6', '-threads 0', '-f webm', '-reserve_index_space 512', '-deadline realtime'])
  .withVideoBitrate(2200)
  .withAudioCodec('libvorbis')
    .withSize('1280x720')
    .seekInput(seek)
    .format('webm')
    
    /*
    .withVideoCodec('libx264')
                            .addOptions(['-preset veryfast', '-f mp4', '-movflags faststart'])
                            .withVideoBitrate("1024k")
                            .withAudioCodec('libfdk_aac')
                            .fps(25)
                            .withSize('1280x720')
                            .format('mp4')
    
    */
    
                            
                            
                            /*
                            .withVideoCodec('libx264')
                            .addOptions(['-crf 22', '-movflags faststart'])
                            .withVideoBitrate("1024k")
                            .withAudioCodec('aac')
                            .fps(25)
                            .withSize('1280x720')
                            .format('mp4')
                            */
                            
                            .on('error', function(err, stdout, stderr) {
                                console.log('an error happened: ' + err.message);
                                console.log('ffmpeg stdout: ' + stdout);
                                console.log('ffmpeg stderr: ' + stderr);
                            })
                            .on('end', function() {
                                console.log('Processing finished !');
                            })
                            .on('progress', function(progress) {
                                console.log('Processing: ' + progress.percent + '% done');
                            })
                            .pipe(res, {
                                end: true
                            });
                        
                    
                    }).listen(port);
                    console.log("video stream running on port: " + port);
                    future.return({port:port, duration: metadata.format.duration});
                    

                });
                
                            }
})



                return future.wait();


                /*	    

                http.createServer(function(req, res) {
                  // The filename is simple the local directory and tacks on the requested url
                  var filename = "/home/colt/Plex/movies/Zoolander.2001.1080p.BluRay.AC3.DTS.ML.x264-HDC.cp(tt0196229)/Zoolander.2001.1080p.BluRay.AC3.DTS.ML.x264-HDC.mkv";

                  // This line opens the file as a readable stream
                  var readStream = fs.createReadStream(filename);

                  // This will wait until we know the readable stream is actually valid before piping
                  readStream.on('open', function () {
                    // This just pipes the read stream to the response object (which goes to the client)
                    readStream.pipe(res);
                    console.log("piping");
                  });

                  // This catches any errors that happen while creating the readable stream (usually invalid names)
                  readStream.on('error', function(err) {
                    res.end(err);
                    console.log(err);
                  });
                }).listen(8080);
                console.log("listening!")






                // create the target stream (can be any WritableStream)
                var stream = fs.createWriteStream('/home/colt/Plex/movies/White.House.Down.2013.1080p.BluRay.DTS.x264-CyTSuNee/White.House.Down.2013.1080p.BluRay.DTS.x264-CyTSuNee.mkv')

                // make sure you set the correct path to your video file
                var proc = ffmpeg(stream)
                  // use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
                  .preset('flashvideo')
                  // setup event handlers
                  .on('end', function() {
                    console.log('file has been converted succesfully');
                  })
                  .on('error', function(err, stdout, stderr) {
                    console.log('Error: ' + err.message);
                    console.log('ffmpeg output:\n' + stdout);
                    console.log('ffmpeg stderr:\n' + stderr);
                  })
                  // save to stream
                  .pipe(stream, {end:true}); //end = true, close output stream after writing




                */



            },

            guessIt: function() {

                this.unblock();

                notifications.permissions.read(function(userId, eventName) {
                    return true;
                });


                var future = new Future();

                var fs = Meteor.npmRequire('fs');

                root = "/home/colt/Plex/movies/";

                var files = fs.readdirSync(root);

                var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

                files.forEach(function(file, index, array) { // For each file that is in the directory


                    title = file;

                    var filename = title;

                    var result = (Meteor.http.call("GET", "http://localhost:5000/?filename=" + filename));

                    name = result.data.title; // Get the name of the movie according to the guess

                    Moviess.insert({
                        name: name
                    });


                }.bind(this));

                var fetch = Moviess.find().fetch();

                var returned = [];


                fetch.forEach(function(file, index, array) { // This runs a foreach to go through every movie in the movie collection.

                    run = run + 1;

                    if (run >= 20) {
                        run = 0;
                        notifications.emit('message', 'YOU HIT THE LIMIT FOR TMDB');
                        Meteor.setTimeout(function() {
                            notifications.emit('message', 'THE LIMIT IS UP');

                        }, 20000);



                    }
                    else {

                        finished = finished + 1;
                        name = file.name;
                        console.log(name);



                        Streamy.emit('hello', {
                            data: 'Searching for ' + name
                        });
                        Meteor.call('searchMovie', name, function(error, movie) { // Do a search on TMDB for movies matching the name

                            if (error) {
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
                                notifications.emit('message', 'Found ' + name);
                                var it = movie.results[0]; // Traverse only in the first array returned. I'd like to eventually setup my own equation to see whether the search result is actually the correct movie, but I'm relying on the TMDB search currently.

                                var search = Moviess.findOne({
                                    name: name
                                });
                                // console.log(search._id);
                                var overview = it.overview;
                                var release = it.release_date;
                                var runtime = it.runtime;
                                var poster_base = base_url;
                                var poster = it.poster_path;
                                var movie_id = it.id;

                                Moviess.update({
                                    _id: search._id
                                }, {
                                    name: name,
                                    overview: overview,
                                    release: release,
                                    runtime: runtime,
                                    old_name: old_name,
                                    poster: poster_base + poster,
                                    movie_id: movie_id
                                });




                                notifications.emit('message', 'Just finished ' + name);
                                notifications.emit('message', movie);



                            }

                        });
                    }

                });

                console.log("DONE");
                future.return(returned);
                return future.wait();

            },


            updateMovie: function(id, name, overview, release, runtime, poster_base, poster, movie_id) {

                var future = new Future();

                Moviess.update({
                    _id: id
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
            
            
            
            folderTree: function(folder) {
                
                this.unblock();
                
                notifications.permissions.read(function(userId, eventName) {
                    return true;
                });
                
                
                var future = new Future();
                var walk = Meteor.npmRequire('walk'),
                    fs = Meteor.npmRequire('fs'),
                    mime = Meteor.npmRequire('mime'),
                    walker,
                    path = Meteor.npmRequire('path'),
                    directories = [];
                    
                    var options = {
                        
                        followLinks: true
                        // directories with these keys will be skipped 
                        , filters: ["Temp", "_Temp"]
                
                    };
                 
                    walker = walk.walk(folder, options);
                
                walker.on('directories', Meteor.bindEnvironment(function (root, dirStatsArray, next) {
                    
                    
                    directories = dirStatsArray;
                    notifications.emit('message', root);
                    notifications.emit('message', dirStatsArray);
                    //next();
                    notifications.emit('message', "All Folders");
                    notifications.emit('message', directories);
                    future.return(directories);
                    
                }));
                
                walker.on("errors", function(root, nodeStatsArray, next) {
                    
                    notifications.emit('message', "ERROR");
                    notifications.emit('message', nodeStatsArray);
                    notifications.emit('message', root);
                    next();

                });
                
                walker.on("end", Meteor.bindEnvironment(function() {
                    
                    notifications.emit('message', "All Folders");
                    notifications.emit('message', directories);
                    
                    future.return(directories);
                    
                }));
                
                
                return future.wait();
                
                
            },






            guessIt2: function(id, folder) {

                this.unblock();

                search_running = "yes"

                notifications.permissions.read(function(userId, eventName) {
                    return true;
                });
                
                var allVideos = [];
                var future = new Future();
                var walk = Meteor.npmRequire('walk'),
                    fs = Meteor.npmRequire('fs'),
                    mime = Meteor.npmRequire('mime'),
                    walker,
                    path = Meteor.npmRequire('path');
                
                walker = walk.walk(folder);
                
                walker.on("file", Meteor.bindEnvironment(function(root, fileStats, next) {
                    

                    /*
             
                    I'd like to have something to determine whether or not this folder has been entered, and if it has, use the biggest video file.
                    I have a problem right now with sample files. They are sometimes included in the folder with the movie, and right now, I have
                    it acting like that is it's own movie.
             
                    */

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
                                    
                                    
                                    
                                    
                                    
                                        
                                    Moviess.insert({
                                        name: result,
                                        location: [location],
                                        section: id,
                                    });

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



                walker.on("errors", function(root, nodeStatsArray, next) {
                    
                    notifications.emit('message', "ERROR");
                    notifications.emit('message', root);
                    future.return("Error! " + next);

                });


                walker.on("end", Meteor.bindEnvironment(function() {

                    
                    
                    var fetch = Moviess.find({section: id}).fetch();
                    
                    notifications.emit('message', "allVideos");
                    notifications.emit('message', fetch);

                    fetch.forEach(function(file, index, array) { // This runs a foreach to go through every movie in the movie collection.

                        run = run + 1; // This adds one to the current run count

                        if (run >= 20) { // When the run count hits 20 or more
                        
                            run = 0;
                            notifications.emit('message', 'YOU HIT THE LIMIT FOR TMDB');
                            Meteor._sleepForMs(30000); // Find the currect time to put it to sleep for
                            notifications.emit('message', 'THE LIMIT IS UP');
                            finished = finished + 1;

                            name = file.name; // Getting the name of the movie

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

                                        Moviess.update({
                                            _id: file._id,
                                            section: id,
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

                                                console.log("single - SUCCESSFULLY UPDATED: " + title + " id: " + file._id);
                                            }
                                        });


                                    }
                                    else {
                                        notifications.emit('message', 'There were no results searching for ' + name);


                                        Moviess.update({
                                            _id: file._id,
                                            section: id,
                                        }, {
                                            $set: {
                                                hide: 'yes'
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

                            name = file.name; // Getting the name of the movie

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

                                        Moviess.update({
                                            _id: file._id,
                                            section: id,
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

                                                console.log("single - SUCCESSFULLY UPDATED: " + title + " id: " + file._id);
                                            }
                                        });


                                    }
                                    else {
                                        notifications.emit('message', 'There were no results searching for ' + name);


                                        Moviess.update({
                                            _id: file._id,
                                            section: id,
                                        }, {
                                            $set: {
                                                hide: 'yes'
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

                    });
                    
                    //var result2 = Moviess.find().fetch();
                    
                    /*
                    var pipeline = [
                      {$group: {_id: null, resTime: {$sum: "$resTime"}}}
                    ];
                    */
                    
                    var pipeline = [
                        { $group: { 
                            // Group by fields to match on (a,b)
                            _id: "$name",
                    
                            // Count number of matching docs for the group
                            count: { $sum:  1 },
                    
                            // Save the _id for matching docs
                            docs: {
                            
                            $push: {
                                _id: "$_id",
                                location: "$location"
                            }
                                                
                            }
                        }},
                    
                        // Limit results to duplicates (more than 1 match) 
                        { $match: {
                            count: { $gt : 1 }
                        }}
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
                    var result2 = Moviess.aggregate(pipeline);
                    
                    notifications.emit('message', "pipeline");
                    notifications.emit('message', result2);
                    
                    


                    result2.forEach(function(file, index, array) {
                        
                        notifications.emit('message', "All ones");
                        notifications.emit('message', file);
                        
                        var location_array = [];
                        var updateId = file.docs[0]._id;
                        var idArray = [];
                        file.docs.shift(); 
                        
                        
                        file.docs.forEach(function(file, index, array) {
                            
                            
                            
                            location_array.push(file.location[0]);
                            idArray.push(file._id);
                            /*
                            
                            Moviess.remove({
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
                            */
                            
                            
                        });
                        
                        notifications.emit('message', "All ids");
                        notifications.emit('message', idArray);
                        
                        /*
                        Moviess.remove({'_id':{'$in':idArray}},
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
                        Moviess.update({
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
                        
                        */
                        
                        notifications.emit('message', "All locations");
                        notifications.emit('message', location_array);
                        notifications.emit('message', updateId);
                        
                        
                        
                        /*
                        var id_array = [];
                        var location_array = [];

                        notifications.emit('message', file.name);
                        var fetch = Moviess.find({
                            name: file.name,
                            section: id,
                        }).fetch();
                        
                        

                        fetch.forEach(function(file, index, array) {

                            id_array.push(file._id);
                            notifications.emit('message', "Just pushed new id");
                            location_array.push(file.location);
                            notifications.emit('message', "Just pushed new location");

                        });

                        var id1 = id_array.shift();

                        Moviess.update({
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


                        id_array.forEach(function(file, index, array) {

                            Moviess.remove({
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
                        
                        */


                    });


                    search_running = "";


                    future.return("Finished!");
                    
                    

                }));


                return future.wait();
            },
            
            
            
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
                    

                    /*
             
                    I'd like to have something to determine whether or not this folder has been entered, and if it has, use the biggest video file.
                    I have a problem right now with sample files. They are sometimes included in the folder with the movie, and right now, I have
                    it acting like that is it's own movie.
             
                    */

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
                                        
                                    var addMovie = Moviess.insert({
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

                    addedMovies.forEach(function(file, index, array) {
                        
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

                                        Moviess.update({
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


                                        Moviess.update({
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


            showName2: function(name) {
                var future = new Future();
                var call = Meteor.http.call('GET', "http://localhost:5000/?filename=" + name + "&options=--type%3Depisode%20", {});
                var info_array = [];

                future.return(call.data);




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



            showName4: function(folder, name, nameOg) {
                var walk = Meteor.npmRequire('walkdir');
                var path = Meteor.npmRequire('path');
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
                  var call = Meteor.http.call( 'GET', "http://localhost:5000/?filename=" + name + "&options=--type%3Depisode%20", {} );
                } catch(e) {
                  notifications.emit('message', "There was an error trying to guess the name - Maybe the GuessIt server isn't up? ");
                  notifications.emit('message', e);
                  future.return("There was an error trying to guess the name - Maybe the GuessIt server isn't up? ");
                }
                
                
                
                
                //var call = Meteor.http.call('GET', "http://localhost:5000/?filename=" + name + "&options=--type%3Depisode%20", {});
                var info_array = [];

                if (call.data.episode && !call.data.title && !call.data.season) {

                    notifications.emit('message', name + " has an episode, doesn't have a title, and doesn't have a season");
                    Meteor.call('showName3', call.data.episode, function(error, result) {

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




            showName3: function(name) {
                var future = new Future();
                name = encodeURIComponent(name);
                var call = Meteor.http.call('GET', "http://localhost:5000/?filename=" + name + "&options=--type%3Depisode%20--expected-title%3D" + name, {});
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


            guessShow3: function(section, location) {


                "use strict";

                this.unblock();
                
                sectionId = section;


                notifications.permissions.read(function(userId, eventName) {
                    return true;
                });

                var future = new Future();
                var walk = Meteor.npmRequire('walkdir');
                var path = Meteor.npmRequire('path');
                var countrynames = Meteor.npmRequire('countrynames');
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
                    //notifications.emit('message', directories);

                    directories.forEach(function(file, index, array) {

                        notifications.emit('message', file);

                        var directory = file;


                        var showNameWrap = Async.wrap(showName);

                        var showNameResponse = showNameWrap(file);

                        //var name2 = showNameResponse.title;




                        var showSearchWrap = Async.wrap(showSearch);

                        var response = showSearchWrap(showNameResponse, showNameResponse.title, file);

                        notifications.emit('message', response);

                        if (response.series) {
                            
                            // Need to include a check for duplicate episodes
                            
                            var seasons = response.seasons;
                            

                            var directoryWrap = Async.wrap(directoryRecur);

                            var response2 = directoryWrap(directory, response.series, seasons);

                        }

                    })
                    
                    
                    notifications.emit('message', "Here's all the loose episodes I found.");
                    notifications.emit('message', episode_list);
                    
                    
        
                    
                    
                 var episode_list1 = [];   
                 
                 
                 episode_list.filter(function(obj) {
                     
                     var check1 = episode_list1.indexOf( obj.name );
                     var check2 = obj.name;
                     
                     
                     var check3 = function findValue(episode_list1, check2) {
                            for(var i = 0; i<episode_list1.length; i++) {
                                if(episode_list1[i].name === check2) return i;
                            }
                            return -1;
                        }
                        
                        
                        notifications.emit('message', "check3");
                        notifications.emit('message', check3);
                     
                     
                     
                     
 
                if(check3){
                 
                  notifications.emit('message', "Looks like " + obj.location + " is a duplicate for " + obj.name);
                 
                } else {
                 
                      episode_list1.push({name: obj.name, episodes: [obj]});
                      notifications.emit('message', "Push " + obj.name);
                }
                                     
                                     
                                     
                    
                });
                
                notifications.emit('message', "Here's episode_list1");
                
                notifications.emit('message', episode_list1);


                    var allShows = Tv.find({section: sectionId}).fetch();

                    notifications.emit('message', "I finished adding all your shows. I'm now going to pickup some extra metadata in the background for episodes, etc. Here's all the shows you have in your database:");
                    notifications.emit('message', allShows);


                    allShows.forEach(function(file, index, array) {

                        var _id = file._id;
                        var id = file.show_id;
                        name = file.name;
                        var episode_info = file.episode_info;
                        notifications.emit('message', "All show info for " + name + " :");
                        notifications.emit('message', file);
                        

                        file.seasons.forEach(function(file, index, array) {

                            //notifications.emit('message', 1);
                            var season = file.season_number;
                            var season_posters = [];
                            var episodes = file.episodes;
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

                                        banners.forEach(function(file, index, array) {

                                            if (file.Season == season) {
                                                season_posters.push("http://thetvdb.com/banners/" + file.BannerPath)
                                                    //notifications.emit('message', file);







                                            }

                                        });




                                        var episodeArray = [];
                                        


                                        episodes.forEach(function(file, index, array) {

                                            
                                            
                                            if (file.episode) {
                                                
                                                var episode = file.episode;

                                            notifications.emit('message', "Checking " + name + " season " + season + " episode " + episode);


                                            var episodeIndex = episodeInfo.filter(function(obj) {
                                                return obj.EpisodeNumber == episode;
                                            }).map(function(obj) {
                                                return {

                                                    episode: episode,
                                                    location: file.location,
                                                    name: obj.EpisodeName,
                                                    banner: "http://thetvdb.com/banners/" + obj.filename

                                                }
                                            });


                                            if (episodeIndex) {

                                                notifications.emit('message', episodeIndex);


                                                episodeArray.push(episodeIndex[0]);

                                            }
                                            
                                        }

                                        });
                                        


                                        notifications.emit('message', season_posters);




                                        var tv_update3 = Tv.update({
                                                _id: _id,
                                                'seasons.season_number': season,
                                                section: sectionId,
                                            }, {
                                                $set: {
                                                    "seasons.$.poster": season_posters[0],
                                                    "seasons.$.posters": season_posters,
                                                    "seasons.$.episodes": episodeArray

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
                var TVDB = Meteor.npmRequire("node-tvdb/compat");
                var tvdb = new TVDB("79403F2E528405DB");



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
                var TVDB = Meteor.npmRequire("node-tvdb/compat");
                var tvdb = new TVDB("79403F2E528405DB");

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
                var TVDB = Meteor.npmRequire("node-tvdb/compat");
                var tvdb = new TVDB("79403F2E528405DB");

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
                var TVDB = Meteor.npmRequire("node-tvdb/compat");
                var tvdb = new TVDB("79403F2E528405DB");

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
                var TVDB = Meteor.npmRequire("node-tvdb/compat");
                var tvdb = new TVDB("79403F2E528405DB");

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
                var TVDB = Meteor.npmRequire("node-tvdb/compat");
                var tvdb = new TVDB("79403F2E528405DB");



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


            removeMovies: function(section) {

                return Moviess.remove({section: section});

            },

            removeShows: function(section) {



                return Tv.remove({section: section});

            },



        });


    });



}
