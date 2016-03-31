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





var timeout = 0;
var url = "http://api.themoviedb.org/3/configuration?api_key=23290308516dcbfcb67fb0f330028492";
var base_url = "http://image.tmdb.org/t/p/w396";
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
            var time;
            
            var myVideo = document.createElement('video');
            
            
            if (myVideo.canPlayType('video/webm')) {
                console.log("You can play webm")
                Meteor.call('streamWebm', location, function(error, result) {
                  if (error) {
                      
                      console.log(error);
                      
                  } else {
                      
                      console.log(result);
                      //videojs("video").ready(function(){
                      var player = videojs("video").ready(function(){
                          //var player = videojs('video', {  }, function() {
                          console.log('Good to go!');
                          
                          /*
                          
                          I have to figure out a way to pass the correct port for the video to the video player on the page.
                          
                          */
                          this.bigPlayButton.hide();
                          this.loadingSpinner.show();
                          
                          
                          // find out way to get loading spinner to show up so user knows something is happening.
                          
                          
                          //this.duration(result.duration);
                          
                          // {"type":"application/x-mpegURL", "src":"http://167.114.103.80:2347/stream/stream.m3u8"},
                          this.src({"type":"video/webm", "src":"http://167.114.103.80:"+result.port});
                          //this.duration(result.duration);
                          this.load();
                          //this.play();
                          
                          // The duration gets screwed up for some reason, but if i pause the video once the page loads, the duration is right. Why?
                          
                          this.on("loadedmetadata", function(){
                            
                            this.duration(result.duration);
                            this.play();
                            this.loadingSpinner.hide();
                            
                    
                          });
                          
                          
                          this.on("seeking", function(){
                            
                            console.log('seeking to ' + this.currentTime() );
                            time = this.currentTime(); // Set time to the time you want to seek to
                            
                            Meteor.call('streamSeekWebm', location, time, function(error, result) {
                                      if (error) {
                                          
                                          console.log(error);
                                          
                                      } else {
                                          
                                          player.src({"type":"video/webm", "src":"http://167.114.103.80:"+result.port});
                                          player.load();
                                          //player.currentTime(time);
                                          //player.play();
                                          
                                      }
                                         
                            });
                            
                          
                
                          });
                          
                          
                          
                          
                          
                          
                          
                        });
                      
                      
                  }
            
            
            });
            }
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            else if (myVideo.canPlayType('video/mp4')) {
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
                            
                            console.log('seeking to ' + this.currentTime() );
                            time = this.currentTime(); // Set time to the time you want to seek to
                            
                            Meteor.call('streamSeekMp4', location, time, function(error, result) {
                                      if (error) {
                                          
                                          console.log(error);
                                          
                                      } else {
                                          
                                          player.src({"type":"video/mp4", "src":"http://167.114.103.80:"+result.port});
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

            Meteor.call('addShows', route.params._id, location, function(error, result) { // Try to guess the title from the filename

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
        
        
        'click .movie-img': function(event, template) {
            
            /*
            if (this.location.length > 1) { // If multiple versions of the video
                
                $('#videoVersionModal').foundation('open');
                Session.set("videoVersions", this.location);
                
            } else { // Only one version of the video
            */
            
            Session.set("location", this.location[0]);
            Router.go('player');
            
            //}
            
            
            
        },
        
        
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
    /*
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
        */

        'click .scan': function(event, template) {
            event.preventDefault();


            var route = Router.current();
            
            var location = this.location;
            
            console.log(location);

            Meteor.call('addMovies', route.params._id, location, function(error, result) { // Try to guess the title from the filename

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
                

                
                
                //




                

                var seasonEps = "";


                



                
                
                
                
                
                
                
                
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
        
        //console.log(allSections);
        
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
        
        
        
        
        


    });



}
