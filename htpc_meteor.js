Movies = new Meteor.Collection('movies');
Tv = new Meteor.Collection('tv');
Sections = new Meteor.Collection('sections');
ServerSettings = new Meteor.Collection('serverSettings');
notifications = new Meteor.Stream('server-notifications');





import path from 'path';
import ViewList from 'view-list';
//import chokidar from 'chokidar';


var movieSearch = new EasySearch.Index({
    collection: Movies,
    fields: ['name'],
    engine: new EasySearch.MongoDB(),
});


var tvSearch = new EasySearch.Index({
    collection: Tv,
    fields: ['name'],
    engine: new EasySearch.MongoDB()
});


var url = "http://api.themoviedb.org/3/configuration?api_key=23290308516dcbfcb67fb0f330028492";
var base_url = "http://image.tmdb.org/t/p/w396";
var timeoutId = 0;


/*

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

*/




if (Meteor.isClient) {
    
    var tvSubscription;
    
    var movieSubscription;


    Search = new Mongo.Collection('search');
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

        'click .banner-wrapper': function(event, template) {

            if (this.location.length > 1) { // If multiple versions of the video

                $('#videoVersionModal').foundation('open');
                Session.set("videoVersions", this.location);

            }
            else { // Only one version of the video
            
            console.log("season_number test " + template);
            console.log("episode test " + this.episode);
            
            var route = Router.current();
            console.log("route");
            console.log(route);

                Session.set("location", this.location[0]);
                Session.set("videoInfo", {_id: this._id, location: this.location[0], section: this.section, format: "show", season: template.season_number, episode: this.episode});
                Blaze.renderWithData(Template.player, {_id: route.params._id, location: this.location[0], section: route.params.section, format: "show", season: this.season_number, episode: this.episode}, $("body")[0]);
                $("body").addClass("overflow-hidden");
                //Blaze.render(Template.player, $("body")[0]);
                /*
                Instead of using sessions, just render with data
                
                Blaze.renderWithData(Template.videoTop, {my: "data"}, $(".video-js")[0])
                
                
                I will probably need to redesign the show schema. Probably have seasons alone in their own object, and episodes alone in their own object. The problem I have with
                this, though, is that I would have to do a find for all episodes with a specific season number to find the episodes for the season. That may take time.
                
                */
                
                
                
                //Session.set("player", true);
                //Router.go('player');

            }

        },






    });

    Template.login.events({

        'submit #login': function(event, template) {

            event.preventDefault();
            var username = $('#username').val();
            var password = $('#password').val();

            Meteor.loginWithPassword(username, password, function(err) {
                if (!err) {
                    Router.go('/');
                }
                else {
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
            }
            else {


                console.log("There's no users");
                admin = true;
            }

            var user = {

                email: email,
                username: username,
                password: password,
                profile: {
                    admin: admin
                }

            };

            Accounts.createUser(user, function(err) {
                if (err) {
                    alert("There was an error, please try again" + err.reason);
                }
                else {
                    //Router.go('/login');
                    console.log(username + " is now a user");
                    Meteor.loginWithPassword(username, password, function(err) {
                        if (!err) {
                            Router.go('/');
                        }
                        else {
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

                }
                else {

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
        
        percent: function() {
            
            //console.log("Checking for progress on " + this.name);
            
            if (this.progress) {
                
                //console.log("There is progress for " + this.name + " " + this.progress);
                //console.log("The runtime is " + this.runtime);
                
                //var percent = Math.floor((this.progress / this.runtime) * 100);
                var percent = ((this.progress / this.runtime) * 100).toFixed(2);
                
                return percent;
                
            } else {
                
                return false;
                
            }
            
        },
        


    });


    Template.sidebar.helpers({

        sections: function() {

            return Sections.find({});

        },




    });

    Template.sidebarMobile.helpers({

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

        'keyup #new-content-location': function(event, template) {

            clearTimeout(timeoutId); // doesn't matter if it's 0
            timeoutId = setTimeout(function() {

                console.log("Handler for .keypress() called.");

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

            var name = $('#new-content-name').val();
            var location = $('#new-content-location').val();
            var format = $("#new-content-format").val();

            Meteor.call('addSection', name, location, format, function(error, result) {

                if (error) {

                    console.log("There was an error adding the section. " + error);

                }
                else {

                    console.log("Added new section.");
                    //$('#add-content').foundation('close');
                    $('#add-content').foundation('close');
                    //$('[data-remodal-id=modal]').remodal().close();






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


    Template.searchCustom.helpers({

        movies: function() {

            return Session.get("movie-searchbox");

        },

        shows: function() {

            return Session.get("tv-searchbox");

        },


    });

    Template.searchCustomMobile.helpers({

        movies: function() {

            return Session.get("movie-searchbox");

        },

        shows: function() {

            return Session.get("tv-searchbox");

        },


    });


    Template.searchCustom.onRendered(function() {


        $("#search-suggestions").mouseover(function() { // add hover class on mouseover
            $("#search-suggestions").addClass("hover");
        });

        $("#search-suggestions").mouseleave(function() { // remove hover class on mouseleave
            $("#search-suggestions").removeClass("hover");
            $("#search-suggestions").trigger('hoverRemoved'); // trigger the bind on the hover class
        });



    });


    Template.sidebarMobile.events({


        'keyup #search-bar-mobile': function(event, template) {

            var val = $("#search-bar-mobile").val();
            console.log("search-bar-mobile")
            console.log(val)

            if (val.length > 0) {

                Tracker.autorun(function() {

                    let movies = movieSearch.search({
                        name: val
                    }, {
                        limit: 3
                    }).fetch();
                    let tv = tvSearch.search(val, {
                        limit: 3
                    }).fetch();

                    Session.set("movie-searchbox", movies);
                    Session.set("tv-searchbox", tv);
                    console.log(movies)

                });

                $('#mobile-search-suggestions').show();

            }
            else {

                $('#mobile-search-suggestions').hide();

            }


        },

        'focusout #search-bar-mobile': function(event, template) {

            setTimeout(function() { // just do a quick setTimeout to allow for link clicks in the suggestions div. Maybe do something else here?

                $('#mobile-search-suggestions').hide();

            }, 100);







        },


        'focus #search-bar-mobile': function(event, template) {

            var value = $("#search-bar-mobile").val();

            console.log("value");
            console.log(value);

            if (value.length > 0) {

                console.log("Showing search");
                $('#mobile-search-suggestions').show();

            }


        },





    });




    Template.searchCustom.events({



        'keyup #search-bar': function(event, template) {
            
            Meteor.setTimeout(function(){
                
                
                
                var val = $("#search-bar").val();
                

                if (val.length > 0) {
    
                    Tracker.autorun(function() {
    
                        let movies = movieSearch.search({
                            name: val
                        }, {
                            limit: 3
                        }).fetch();
                        let tv = tvSearch.search(val, {
                            limit: 3
                        }).fetch();
    
                        Session.set("movie-searchbox", movies);
                        Session.set("tv-searchbox", tv);
                        console.log(movies);
    
                    });
    
                    $('#search-suggestions').show();
    
                }
                else {
    
                    $('#search-suggestions').hide();
    
                }
                
                
            }, 500);


        },


        'focus #search-bar': function(event, template) {

            var value = $("#search-bar").val();

            console.log("value");
            console.log(value);

            if (value.length > 0) {

                console.log("Showing search");
                $('#search-suggestions').show();

            }


        },

        'focusout #search-bar': function(event, template) {

            if ($('#search-suggestions').hasClass("hover")) { // check to see if the user is in the search suggestions div


                $("#search-suggestions").bind('hoverRemoved', function() { // get notified when the hover class gets removed
                    $('#search-suggestions').hide();
                    $("#search-suggestions").unbind("hoverRemoved"); // unbind from it
                });

            }
            else {
                $('#search-suggestions').hide();
            }






        },




    });



    Template.editContentSidebar.events({



        'keyup #edit-content-location': function(event, template) {

            clearTimeout(timeoutId); // doesn't matter if it's 0
            timeoutId = setTimeout(function() {

                console.log("Handler for .keypress() called.");

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

            var name = $('#edit-content-name').val();
            var location = $('#edit-content-location').val();
            var format = $("#edit-content-format").val();
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


    Template.sidebarMobile.events({



        'click .edit': function(event, template) {

            event.preventDefault();

            console.log("You clicked edit.");

            var name = this.name;
            var location = this.location;
            var format = this.format;
            var id = this._id;

            Session.set("editSection", id);

            console.log(name);

            $('#edit-content').foundation('open');

            $('#edit-content-name').val(name);
            $('#edit-content-location').val(location);
            //$("#edit-content-format select").val(format);
            $("#edit-content-format").val(format);

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

            var folder = $("#new-content-location").val();


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




    Template.sidebar.events({



        'click .edit': function(event, template) {

            event.preventDefault();

            console.log("You clicked edit.");

            var name = this.name;
            var location = this.location;
            var format = this.format;
            var id = this._id;

            Session.set("editSection", id);

            console.log(name);

            $('#edit-content').foundation('open');

            $('#edit-content-name').val(name);
            $('#edit-content-location').val(location);
            //$("#edit-content-format select").val(format);
            $("#edit-content-format").val(format);

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

            var folder = $("#new-content-location").val();


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

    Template.home.onCreated(function() {

        Session.set("homeTemplateSections", true);

    });
    
    
    


    Template.home.helpers({
        
        movieCount: function() {
            
            var data = Movies.find();

            if(data.count()){
                return true;
            } else {
                return false;
            }
            
            
        },
        
        
        showCount: function() {
            
            var data = Tv.find();

            if(data.count()){
                return true;
            } else {
                return false;
            }
            
            
        },
        
        
        percent: function() {
            
            //console.log("Checking for progress on " + this.name);
            
            if (this.progress) {
                
                //console.log("There is progress for " + this.name + " " + this.progress);
                //console.log("The runtime is " + this.runtime);
                
                //var percent = Math.floor((this.progress / this.runtime) * 100);
                var percent = ((this.progress / this.runtime) * 100).toFixed(2);
                
                return percent;
                
            } else {
                
                return false;
                
            }
            
        },
        
        
        percentShow: function() {
            
            //console.log("Checking for progress on " + this.name);
            
            if (this.episode.progress) {
                
                //console.log("There is progress for " + this.name + " " + this.progress);
                //console.log("The runtime is " + this.runtime);
                
                //var percent = Math.floor((this.progress / this.runtime) * 100);
                var percent = ((this.episode.progress / this.episode.runtime) * 100).toFixed(2);
                
                return percent;
                
            } else {
                
                return false;
                
            }
            
        },

        shows: function() {

            var shows = Tv.find({});
            var array = [];


            shows.forEach(Meteor.bindEnvironment(function(file) {
                
                //console.log("BBBB");
                    //console.log(file);

                    if (file.episodes) {
                        //console.log("TTTT");
                    //console.log(file);
                    
                    var test = file.episodes.sort(function(a) {
                        //return a.date.getTime() - new Date().getTime();
                        return new Date().getTime() - a.date.getTime();
                    });
                    
                    //console.log("Sorted episodes for " + file.name);
                    //console.log(test);
                    //console.log(test[0]);
                
                array.push({show: file, episode: test[0]})

}
            }));
            
            console.log("Episodes array");
            console.log(array);
            
            return array;


        },

        /*
        movie: function() {
            return Movies.find({}, {
                limit: 25
            });
        },
        show: function() {
            return Tv.find({});
        },
        
        
        
        homeTemplate: function() {
            
            return Session.get("homeTemplateSections");
            
        },
        
        
        
        sections: function() {
            
            var sections = Sections.find({});
            
            var sectionArray = [];
            
            
            sections.forEach(Meteor.bindEnvironment(function(file) {
                
                if (file.format === "movies") {
                
                var movies = Movies.find({section: file._id}, {limit: 20, sort: {date: -1}});
                
                
                console.log(movies)
                
                sectionArray.push({section: file, content: movies});
                
                } else if (file.format === "shows") {
                    
                    
                var shows = Tv.find({section: file._id}, {limit: 20, sort: {date: -1}}); // I have to sort by the episodes instead of the actual show. Find shows that have new episodes added.
                
                console.log(shows)
                
                sectionArray.push({section: file, content: shows});
                    
                }
                
                
            }));
            
            return sectionArray;
            
        },
        */

        /*
        sections: function() {
            
            var sections = this.sectionsList;
            console.log(sections)
            var array = [];
            
            
            sections.forEach(Meteor.bindEnvironment(function(file) {
                
                
                var section = Meteor.subscribe('homeTest', file)
                console.log(section)
                if (file.format === "movies" && section.ready) {
                var movies = Movies.find({}).fetch();
        array.push(movies);
                }
            }));
            console.log(array)
            return array
            
        },
        */





    });

    Template.movies.helpers({
        
        content: function() {
            
            var sectionContent = Movies.find().fetch();
            return sectionContent;
      //return Movies.sorted(movieSubscription.loaded());
            
            
            
    },
    
    loadedContent: function() {
      return Movies.find().count();
    },
    
    allContent: function() {
        //return Template.currentData().contentCount;
        //return Template.instance().contentCount.get();
       return Session.get("contentCount"); // I don't want to use sessions. Use something else.
        /*
        var number = 0;
      Meteor.call('countMovies', this._id, Meteor.bindEnvironment(function(error, result) {

                if (error) {
                    console.log("Error retreving amount of movies!");
                }
                
                console.log(result);
                number = result;
                return result;

            }));
            return number;
            */
    },
    
    loading: function() {
      return !movieSubscription.ready();
    },
    hasMore: function() {
        /*
        console.log("hasMore")
        console.log(Template.instance())
        console.log(Template)
        console.log(Template.currentData())
        if (movieSubscription.ready()) {
            console.log("Movie sub is ready");
            console.log(this.content)
        }
        */
        if (movieSubscription.ready()) {
            /*
        console.log("Movie sub is ready");
        console.log(this.content)
        console.log(Template.content)
        console.log(Template)
        console.log(Movies.find().count())
        */
        console.log("Movie count")
        console.log(Movies.find().count())
        console.log("Session count")
        console.log(Session.get("contentCount"))
        console.log(Movies.find().count() === Session.get("contentCount"))
        console.log(Movies.find().count() !== Session.get("contentCount"))
        return Movies.find().count() !== Session.get("contentCount");
        }
        //console.log(Template.instance().content.get())
        //if (movieSubscription.ready()) {
            //console.log("Movie sub is ready");
            
            //return true;
        //}
        /*
        console.log("hasMore")
        console.log(Movies.sorted(movieSubscription.loaded()).count() == movieSubscription.limit())
      return Movies.sorted(movieSubscription.loaded()).count() == movieSubscription.limit();
      */
    },
        
        /*
        content: function() {
            return Movies.find().fetch();
        },
        */
        
        percent: function() {
            
            if (this.progress) {
                
                //var percent = Math.floor((this.progress / this.runtime) * 100);
                var percent = ((this.progress / this.runtime) * 100).toFixed(2);
                
                return percent;
                
            } else {
                
                return false;
                
            }

        },
        
        
        

    });
    
    
    Template.movies.onRendered(function(event, template) {
        
        
        console.log("TEST");
        console.log(Template);
        console.log(this);
        var id = this.data._id;
        console.log(Template.parentData(0));
        console.log(movieSubscription);
        
        
        //var route = Router.current();
        var amount = 50;
        
        Meteor.call('countMovies', id, Meteor.bindEnvironment(function(error, result) { // Make reactive

                if (error) {
                    console.log("Error retreving amount of movies!");
                }
                
                Session.set("contentCount", result);

            }));
        
        
        function visible() {
            
          var vis = $('.js-load-more').visible( true ); // Check if any part the the load more button is visible.
          if (vis && movieSubscription.ready()) {
              console.log("Loading more content.");
              amount += 50;
              movieSubscription = Meteor.subscribe("movies", amount, id);
              return true;
          }
          
          return false;
            
        }
        
        visible();
        
        $(window).scroll(function() { // Run everytime user scrolls
          
          visible();
          
        });


    });

    Template.movies.onCreated(function() {

        var route = Router.current();
        
        console.log("Movie page created. Subscribing to section: " + route.params._id);
        
        
        movieSubscription = Meteor.subscribe("movies", 50, route.params._id);

    });

    Template.movies.onDestroyed(function() {

        console.log("Section destroyed.");
        movieSubscription.stop();


    });

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
    
    
    Template.editShowModal.helpers({

        editShowName: function() {
            return Session.get("editShowName");
        },

    });
    
    Template.editShowModal.events({
    
    'click #save-description': function(event, template) {
            
            event.preventDefault();
            var section = this.section;
            var id = this._id;
            var description = $('#panel-description textarea').val();
            
            Meteor.call('updateShowDescription', id, section, description, function(error, result) {
                if (error) {
                    
                    console.log("Error updating the show description.");
                    console.log(error);

                }
                else {

                    console.log("Updated the show description.");

                }



            });


        },
        
        
        'keyup #edit-show-name': function(event, template) {



            var name = $('#edit-show-name').val();
            
            console.log("Searching for " + name);



            Meteor.call('searchShow4', name, function(error, search) {

                if (error) {
                    console.log("Error searching for the show " + '""' + name + '""' + "!");

                }
                else {

                    console.log(search);
                    Session.set("editShowName", search);


                }

            });








        },
        
        
        
        'click .name-search': function(event, template) {

            var temp = Template.parentData(1);
            var id = temp._id;
            var section = temp.section;
            
            console.log("this");
            console.log(this);
            
            
            var series_name = this.SeriesName;
            var overview = this.Overview;
            var show_id = this.id;
            var banner = "http://thetvdb.com/banners/" + this.banner;
            console.log(id);
            console.log(section);
            console.log(series_name);
            console.log(overview);
            console.log(show_id);
            console.log(banner);
            
            
            
            Meteor.call('searchShow5', show_id, Meteor.bindEnvironment(function(error, result) { // Pull some more data from the show

               if (error) {
                   
                   console.log("There was an error while trying to get the extended data for the show.");
                   console.log(error);
                   
               } else {
                   
                var language = result.language;
                if (result.poster) {
                var poster = "http://thetvdb.com/banners/" + result.poster;
                }
                if (result.fanart) {
                var backdrop = "http://thetvdb.com/banners/" + result.fanart;
                }
                
                console.log(language);
                console.log(poster);
                console.log(backdrop);
                
                
                Meteor.call('updateShow', id, section, series_name, overview, banner, backdrop, language, show_id, poster, result.Episodes, function(error, movie) { // Do a search on TMDB for movies matching the name

                    if (error) {
    
                        console.log("Error updating show.");
    
                    }
                    else {
    
                        console.log("Updated the show.");
                        // Also have to update season posters, episodes, etc.
                        
                    }
                    
                });
                
               }
                                
            }));


        },
        
        
});

    Template.viewShowPage.events({
        
        
        'click #edit': function(event, template) {

            event.preventDefault();

            $('#edit-show').foundation('open');


        },


        'click #remove-show': function(template, event) {
            
            var id = this._id;
            var section = this.section;
            
            console.log("Section: " + section + " id: " + id);

            Meteor.call('removeShow', id, section, Meteor.bindEnvironment(function(error, result) {

                if (result) {
                    console.log("The show has been removed.");
                } else {
                    
                    console.log("Error removing the show!");
                    
                    var history = document.referrer;
                    console.log(section);

                    if (history) {
                        Router.go(history);
                    }
                    else {
                        Router.go('section', {
                            _id: section
                        });
                    }
                    
                }

            }));






        },
        
        
        'click #refresh': function(template, event) {
            
            var id= this._id;
            var section = this.section;
            var name = this.name;
            
            
            
            Meteor.call('searchShow4', name, Meteor.bindEnvironment(function(error, result) {

                if (error) {
                    console.log("There was a problem refreshing the show!");
                    console.log(error);
                } else {
                    
                        var array = result[0]; // The first show found
                        var overview = array.Overview;
                        
                        
                        
                        Meteor.call('refreshShow', id, section, overview, function(error, movie) {

                        if (error) {
                            console.log("There was an error trying to call the update show method.")
                        }
                        else {
                            console.log(name + " has successfully been updated!");
                        }

                    });
                    
                    
                }

            }));
            
        },

    });

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

    Template.shows.events({
        
        'click .js-load-more': function (event) {
      event.preventDefault();

      tvSubscription.loadNextPage();
    },


        'click #right-submission': function(event, template) {

            console.log("Probation set2222!");



        },
        /*

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
            */

        'click .scan': function(event, template) {
            event.preventDefault();

            $(event.currentTarget).addClass('disabled');
            
            var route = Router.current();

            var location = this.location;

            console.log(location);

            Meteor.call('addShows', route.params._id, location, function(error, result) { // Try to guess the title from the filename

                if (error) {

                    console.log("Guess Error!");

                }
                else {

                    console.log(result);
                    $(event.currentTarget).removeClass('disabled');


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
        
        "click .play-movie": function(event, template) {
            
            event.preventDefault();
            console.log("Play movie");
            console.log(this);
            console.log(template);
            
            Session.set("location", this.location[0]);
            Session.set("videoInfo", {_id: this._id, section: this.section});
            Blaze.renderWithData(Template.player, {_id: this._id, location: this.location[0], section: this.section, format: "movie"}, $("body")[0]);
            $("body").addClass("overflow-hidden");

        },
        
        
        "click .play-show": function(event, template) {
            
            event.preventDefault();
            console.log("Play show");
            console.log(this);
            console.log(template);
            
            Session.set("location", this.episode.location[0]);
            Session.set("videoInfo", {_id: this.show._id, section: this.show.section});
            Blaze.renderWithData(Template.player, {_id: this.show._id, location: this.episode.location[0], section: this.show.section, season: this.episode.season_number, episode: this.episode.episode, format: "show"}, $("body")[0]);
            $("body").addClass("overflow-hidden");

        },


    });

    Template.editMovieModal.helpers({

        editMovieName: function() {
            return Session.get("editMovieName");
        },

    });


    Template.editMovieModal.events({
        
        'click #save-description': function(event, template) {
            
            event.preventDefault();
            var section = this.section;
            var id = this._id;
            var description = $('#panel-description textarea').val();
            
            Meteor.call('updateMovieDescription', id, section, description, function(error, result) {
                if (error) {
                    
                    console.log("Error updating the movie description.");
                    console.log(error);

                }
                else {

                    console.log("Updated the movie description.");

                }



            });


        },


        'click .movie-poster': function(event, template) {

            /*
            console.log(this);
            console.log(event);
            console.log(event.currentTarget);
            console.log(template);
            console.log(event.target);
            */
            var temp = Template.parentData(1);
            var id = temp._id;
            var section = temp.section;
            var src = $(event.currentTarget).find('img').attr('src');
            console.log(src);
            //$(event.target).attr(“class”);

            Meteor.call('updateMoviePoster', id, src, section, function(error, movie) { // Do a search on TMDB for movies matching the name

                if (error) {

                    console.log("Error updating movie poster.");

                }
                else {

                    console.log("Updated the movie poster.")


                }



            });


        },

        'click .movie-backdrop': function(event, template) {

            /*
            console.log(this);
            console.log(event);
            console.log(event.currentTarget);
            console.log(template);
            console.log(event.target);
            */
            var temp = Template.parentData(1);
            var id = temp._id;
            var section = temp.section;
            var src = $(event.currentTarget).find('img').attr('src');
            console.log(src);
            //$(event.target).attr(“class”);

            Meteor.call('updateMovieBackdrop', id, src, section, function(error, movie) { // Do a search on TMDB for movies matching the name

                if (error) {

                    console.log("Error updating movie backdrop.");

                }
                else {

                    console.log("Updated the movie backdrop.")


                }



            });


        },


        'click .name-search': function(event, template) {

            /*
            console.log(this);
            console.log(event);
            console.log(event.currentTarget);
            console.log(template);
            console.log(event.target);
            */

            var temp = Template.parentData(1);
            var id = temp._id;
            var section = temp.section;
            var src = $(event.currentTarget).text();
            console.log(src);
            console.log(this.id);
            //$(event.target).attr(“class”);


            var overview = this.overview;
            var release = this.release_date;
            var runtime = this.runtime;
            var poster_base = base_url;
            var poster = this.poster_path;
            var movie_id = this.id;
            var name = this.name;

            console.log("Movie id " + movie_id);

            Meteor.call('updateMovie', id, section, name, overview, release, runtime, poster_base, poster, movie_id, function(error, movie) { // Do a search on TMDB for movies matching the name

                if (error) {

                    console.log("Error updating movie.");

                }
                else {

                    console.log("Updated the movie.");


                    Meteor.call('movieCreditsUpdate', movie_id, id, section, function(error, movie) { // Do a search on TMDB for movies matching the name

                        if (error) {
                            console.log('Error with ' + name);
                            console.log(error);

                        }
                        else {

                            console.log('movieCredits for ' + name);
                            console.log(movie);







                        }



                    });
















                }



            });



        },


        'keyup #edit-movie-name': function(event, template) {



            var name = $('#edit-movie-name').val();



            Meteor.call('searchMovie', name, function(error, movie) { // Do a search on TMDB for movies matching the name

                if (error) {
                    console.log("Error searching for the movie " + '""' + name + '""' + "!");

                }
                else {

                    console.log('Found ' + name);
                    var it = movie.results[0]; // Traverse only in the first array returned. I'd like to eventually setup my own equation to see whether the search result is actually the correct movie, but I'm relying on the TMDB search currently.

                    console.log(movie);
                    Session.set("editMovieName", movie.results);
                    //var search = Movies.findOne({name: name});
                    // console.log(search._id);
                    var overview = it.overview;
                    var release = it.release_date;
                    var runtime = it.runtime;
                    var poster_base = base_url;
                    var poster = it.poster_path;
                    var movie_id = it.id;


                }

            });








        },



    });


    Template.viewMoviePage.onRendered(function() {


        //var x=9;
        //$('.cast-wrapper .cast:lt('+x+')').show();



    });


    Template.viewMoviePage.helpers({

        actors: function() {

            return this.cast.sort(function(obj1, obj2) {
                // Ascending:
                return obj1.order - obj2.order;
            });








        },
        
        percent: function() {
            
            if (this.progress) {
                
                //var percent = Math.floor((this.progress / this.runtime) * 100);
                var percent = ((this.progress / this.runtime) * 100).toFixed(2);
                
                return percent;
                
            } else {
                
                return false;
                
            }
            








        },

    });















    Template.viewMoviePage.events({

        'click .show_all_cast': function(event, template) {

            $(".cast-wrapper").removeClass("fill-cast").addClass("center-flex");
            //$('.cast-wrapper .cast').show();
            $('.show_all_cast').hide();

        },

        'click #searchMovieCast': function(event, template) {

            var section = this.section;
            var id = this._id;
            var movie_id = this.movie_id;

            Meteor.call('searchMovieCast', id, section, movie_id, function(error, result) {
                if (error) {

                    console.log(error);

                }
                else {

                    console.log("Got the cast info.");
                    console.log(result);

                    var x = 9;
                    $('.cast-wrapper .cast:lt(' + x + ')').show();

                }



            });


        },


        'click #edit': function(event, template) {

            event.preventDefault();

            $('#edit-movie').foundation('open');


        },


        'click #download': function(event, template) {


            var filePath = this.location[0];
            console.log(filePath);
            console.log(this);

            Router.go('downloadMoviePage', {
                section: this.section,
                _id: this._id,
                file: filePath
            });








        },


        'click .play-video': function(event, template) {

            /*
            if (this.location.length > 1) { // If multiple versions of the video
                
                $('#videoVersionModal').foundation('open');
                Session.set("videoVersions", this.location);
                
            } else { // Only one version of the video
            */
            
            if (!this.watched) {
                
                Meteor.call('setWatchedMovie', this._id, this.section, function(error, result) {
                if (error) {

                    console.log(error);

                }
                else {
                    
                    console.log("Set video as watched.");
                    
                }
                
                });
                
            }

            Session.set("location", this.location[0]);
            Session.set("videoInfo", {_id: this._id, section: this.section, format: "movie"});
            Blaze.renderWithData(Template.player, {_id: this._id, location: this.location[0], section: this.section, format: "movie"}, $("body")[0]);
            $("body").addClass("overflow-hidden");
            //Blaze.render(Template.player, $("body")[0]);
            //Router.go('player');

            //}



        },


        'click #remove': function(event, template) {

            var section = this.section;
            var id = this._id;

            Meteor.call('removeMovie', id, section, function(error, result) {
                if (error) {

                    console.log(error);

                }
                else {

                    console.log("Removed movie.");
                    var history = document.referrer;
                    console.log(section);

                    if (history) {
                        Router.go(history);
                    }
                    else {
                        Router.go('section', {
                            _id: section
                        });
                    }

                }

            });



        },

        'click #refresh': function(event, template) {
            notifications.on('message', function(message) {
                console.log(message);
            });
            var name = this.name;
            var id = this._id;
            var section = this.section;
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

                    //var search = Movies.findOne({name: name});
                    // console.log(search._id);
                    var overview = it.overview;
                    var release = it.release_date;
                    var runtime = it.runtime;
                    var poster_base = base_url;
                    var poster = it.poster_path;
                    var movie_id = it.id;


                    Meteor.call('updateMovie', id, section, name, overview, release, runtime, poster_base, poster, movie_id, function(error, movie) {

                        if (error) {
                            console.log("There was an error trying to call the update movie method.")
                        }
                        else {
                            console.log(name + " has successfully been updated!");
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
        
        'click .js-load-more': function (event, template) {
      event.preventDefault();
      
        var route = Router.current();
        
        var amount = Session.get("sectionContentCount") + 50;
      
      movieSubscription = Meteor.subscribe("movies", amount, route.params._id);
      
    },

        'click .scan': function(event, template) {
            event.preventDefault();

            $(event.currentTarget).addClass('disabled');

            var route = Router.current();

            var location = this.location;

            console.log(location);

            Meteor.call('addMovies', route.params._id, location, function(error, result) { // Try to guess the title from the filename

                if (error) {

                    console.log("Guess Error!");

                }
                else {

                    console.log(result);
                    $(event.currentTarget).removeClass('disabled');


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
    
    
    Template.nav.onCreated(function() {
        Session.set("player", false);

    });




    



    Template.sidebarMobile.onRendered(function(e) {

        $(document).foundation().ready(function() {
            console.log("ready!");
            $("#offCanvas").on("opened.zf.offcanvas", function(e) {

                $(document.body).addClass("overflow-hidden");


            });

            $("#offCanvas").on("closed.zf.offcanvas", function(e) {

                $(document.body).removeClass("overflow-hidden");


            });
        });


    });




    Template.sidebar.onRendered(function() {
        
        $("#sticker").sticky({ // Stick the sidebar on scroll
            topSpacing: 0
        });
        
        // detect IE + Workaround for IE fixed scroll issues.
        
        var IEversion = (function() {
            
            var ua = window.navigator.userAgent;
            var old_ie = ua.indexOf('MSIE ');
            var new_ie = ua.indexOf('Trident/');
            var edge = ua.indexOf('Edge/');
        
            if ((old_ie > -1) || (new_ie > -1) || (edge > -1)) {
                return true;
            } else {
                return false;
            }
            
        })();

        if (IEversion !== false) {
            console.log("Using IE, eh?...");
            $('body').on("mousewheel", function() {
                event.preventDefault();

                var wheelDelta = event.wheelDelta;

                var currentScrollPosition = window.pageYOffset;
                window.scrollTo(0, currentScrollPosition - wheelDelta);
            });

            $('body').keydown(function(e) {

                var currentScrollPosition = window.pageYOffset;

                switch (e.which) {

                    case 38: // up
                        e.preventDefault(); // prevent the default action (scroll / move caret)
                        window.scrollTo(0, currentScrollPosition - 120);
                        break;

                    case 40: // down
                        e.preventDefault(); // prevent the default action (scroll / move caret)
                        window.scrollTo(0, currentScrollPosition + 120);
                        break;

                    default:
                        return; // exit this handler for other keys
                }
            });
        }

    });





    Template.sidebar.onCreated(function() {

        Meteor.subscribe('sections', function() {
            $(".sidebar .spinner").remove();
        });


    });
    
    
    
    
        Template.shows.onRendered(function(event, template) {
            
        var id = this.data._id;
        var amount = 50;
        
        Meteor.call('countShows', id, Meteor.bindEnvironment(function(error, result) { // Make reactive

                if (error) {
                    console.log("Error retreving amount of shows!");
                }
                
                Session.set("contentCount", result);

            }));
        
        
        function visible() {
            
          var vis = $('.js-load-more').visible( true );
          if (vis && tvSubscription.ready()) {
              console.log("Loading more content.");
              amount += 50;
              tvSubscription = Meteor.subscribe("tv", amount, id);
              return true;
          }
          
          return false;
            
        }
        
        visible();
        
        $(window).scroll(function() { // Run everytime user scrolls
          
          visible();
          
        });

    });

    Template.shows.onCreated(function() {

        var route = Router.current();
        
        console.log("Shows page created. Subscribing to section: " + route.params._id);
        
        
        tvSubscription = Meteor.subscribe("tv", 50, route.params._id);

    });

    Template.shows.onDestroyed(function() {

        console.log("Section destroyed.");
        tvSubscription.stop();


    });


    Template.shows.helpers({
        
        content: function() {
      return Tv.find().fetch();
    },

loadedContent: function() {
      return Tv.find().count();
    },
    
    allContent: function() {
        //return Template.currentData().contentCount;
        //return Template.instance().contentCount.get();
       return Session.get("contentCount"); // I don't want to use sessions. Use something else.
        /*
        var number = 0;
      Meteor.call('countMovies', this._id, Meteor.bindEnvironment(function(error, result) {

                if (error) {
                    console.log("Error retreving amount of movies!");
                }
                
                console.log(result);
                number = result;
                return result;

            }));
            return number;
            */
    },
    
    loading: function() {
      return !tvSubscription.ready();
    },
    hasMore: function() {
        /*
        console.log("hasMore")
        console.log(Template.instance())
        console.log(Template)
        console.log(Template.currentData())
        if (movieSubscription.ready()) {
            console.log("Movie sub is ready");
            console.log(this.content)
        }
        */
        if (tvSubscription.ready()) {
            /*
        console.log("Movie sub is ready");
        console.log(this.content)
        console.log(Template.content)
        console.log(Template)
        console.log(Movies.find().count())
        */
        console.log("Tv count")
        console.log(Tv.find().count())
        console.log("Session count")
        console.log(Session.get("contentCount"))
        console.log(Tv.find().count() === Session.get("contentCount"))
        console.log(Tv.find().count() !== Session.get("contentCount"))
        return Tv.find().count() !== Session.get("contentCount");
        }
        //console.log(Template.instance().content.get())
        //if (movieSubscription.ready()) {
            //console.log("Movie sub is ready");
            
            //return true;
        //}
        /*
        console.log("hasMore")
        console.log(Movies.sorted(movieSubscription.loaded()).count() == movieSubscription.limit())
      return Movies.sorted(movieSubscription.loaded()).count() == movieSubscription.limit();
      */
    },

    });



}

if (Meteor.isServer) {
    
    Meteor.publish("movies", function(limit, section) {
        
            return Movies.find({
      section: section,
      no_results: { $ne: true }
        }, {
            fields: {
                name: 1,
                _id: 1,
                poster: 1,
                location: 1,
                section: 1,
                progress: 1,
                runtime: 1,
            },
            sort: {
                name: 1
            },
            limit: limit
        });
  });

    Meteor.publish('tv', function(limit, section) {
        
        return Tv.find({
            section: section
        },{
            fields: {
                name: 1,
                _id: 1,
                poster: 1,
                section: 1
            },
            sort: {
                name: 1
            },
            limit: limit
        });
        
    });
    

    Meteor.publish('recentShows', function() {
        this.unblock();
        return Tv.find({}, {

            fields: {
                name: 1,
                _id: 1,
                poster: 1,
                section: 1,
                progress: 1,
                episodes: 1, // I probably want to remove this and do a meteor call to get the needed episodes so the client doesn't get every episode on the homepage.
            },
            limit: 20,
            sort: {
                'episodes.date': -1
            }

        })
    });

    Meteor.publish('recentMovies', function() {
        this.unblock();
        return Movies.find({}, {

            fields: {
                name: 1,
                _id: 1,
                poster: 1,
                section: 1,
                watched: 1,
                progress: 1,
                runtime: 1,
                location: 1,
                date: 1,
            },
            limit: 20,
            sort: {
                date: -1
            }

        })
    });

        Meteor.publish('homeSections', function() {
            //this.unblock();

            /*
            return Movies.find({}, {
                
                fields: {
                    name: 1,
                    _id: 1,
                    poster: 1,
                    section: 1,
                },
                sort: {
                    date: -1
                }
                
                
            })
            */
            var sectionArray = [];
            var sections = Sections.find({});

            sections.forEach(Meteor.bindEnvironment(function(file) {

                if (file.format === "movies") {

                    var movies = Movies.find({
                        section: file._id
                    }, {
                        limit: 20,
                        sort: {
                            date: -1
                        }
                    });


                    console.log(movies)

                    sectionArray.push({
                        section: file,
                        content: movies
                    });

                }
                else if (file.format === "shows") {


                    var shows = Tv.find({
                        section: file._id
                    }, {
                        limit: 20,
                        sort: {
                            date: -1
                        }
                    }); // I have to sort by the episodes instead of the actual show. Find shows that have new episodes added.

                    console.log(shows)

                    sectionArray.push({
                        section: file,
                        content: shows
                    });

                }


            }));


            return sectionArray;











        });

    Meteor.publish('users', function() {
        this.unblock();
        return Meteor.users.find({});
    });

    Meteor.publish('sections', function() {
        this.unblock();
        return Sections.find({})
    });

    Meteor.publish('section', function(id) {
        this.unblock();
        return Sections.find({
            _id: id
        })
    });

    Meteor.publish('tv_info', function(id, section) {
        this.unblock();
        return Tv.find({
            _id: id,
            section: section
        });
    });
    
    Meteor.publish('tv_info1', function(id, section) {
        this.unblock();
        return Tv.find({
            _id: id,
            section: section
        },
        {
            fields: {
                _id: 1,
                name: 1,
                overview: 1,
                banner: 1,
                backdrop: 1,
                language: 1,
                show_id: 1,
                series_id: 1,
                poster: 1,
                results: 1,
                episode_info: 1,
                seasons: 1,
                section: 1,
                date: 1,
                date_updated: 1
                
            },
            //limit: 20
        }
        );
    });
    
    
    Meteor.publish('tv_episodes', function(id, section) {
        this.unblock();
        return Tv.find({
            _id: id,
            section: section
        },
        {
            fields: {
                _id: 1,
                section: 1,
                episodes: 1,
            },
            //limit: 20
        }
        );
    });

/*
    Meteor.publish('movies', function(section) {
        this.unblock();
        return Movies.find({
            section: section
        }, {
            fields: {
                name: 1,
                _id: 1,
                poster: 1,
                location: 1,
                section: 1,
                progress: 1,
                runtime: 1,
            },
            sort: {
                name: 1
            }
        });
    });
    */

    Meteor.publish('movie_info', function(id, section) {
        this.unblock();
        return Movies.find({
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
        //var MovieDB = Meteor.npmRequire('moviedb')('23290308516dcbfcb67fb0f330028492');

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


        //var future = new Future();


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

        //var chokidar = Meteor.npmRequire('chokidar');

        var newFolder = false;

        var folderRemoved = false;

        var folderWatch = [];

        //console.log(allSections);

        /*
        
        allSections.forEach(Meteor.bindEnvironment(function(file) {
            
                // Push the folder locations to an array, and then do the folder watch on that array.
                
                
                I also need to figure out what to do when the program isn't running. If it's not running, and then new movies/shows are put in the directory, the folder watch
                won't know. I'll need to run an intial startup search to check for changes or something.
                
                
                
            
            var watcher = chokidar.watch(file.location, {
              ignored: /[\/\\]\./,
              persistent: true,
              ignoreInitial: true,
              awaitWriteFinish: true,
            });
          
          watcher.on('add', Meteor.bindEnvironment(function(path) {
              
              // Likely have to do a check here to check the path to make sure it's just a file and not a file in a new folder, because it sets off file first.
              // Probably do a regex to check if the parent directory of the file is the directory being watched, and not a new directory where the event hasn't gone off yet.
              
              
              
              SINCE THERE'S THE POSSIBILITY OF MULTIPLE FOLDERS/FILES BEING ADDED AT THE SAME TIME, I'LL HAVE TO FIGURE SOMETHING OUT. MAYBE ON FOLDER-ADD, PUSH THE PATH INTO AN
              ARRAY, AND THEN CHECK IF THE FILE IS IN THE DIRECTORY USING A REGEX FUNCTION.
              
              FOR INSTACNE: A FILE MIGHT BE ADDED AT 'HOME/COLT/PLEX/TEST_SEARCH/NEW_FOLDER/MOVIE.MKV', AND 'NEW_FOLDER' IS A NEW FOLDER. I WOULD ADD THE FOLDER PATH ON FOLDER-ADD
              TO AN ARRAY, AND EXTRACT THE STRING AFTER THE LAST SLASH, THEN CHECK TO SEE IF THAT'S THE PARENT FOLDER OF THE FILE.
              
              
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
                  var movieFind = Movies.find({location: new RegExp(pathRegex)}).fetch();
                  notifications.emit('message', 'movieFind');
                  notifications.emit('message', movieFind);
                  
                  movieFind.forEach(function(doc) {
                        
                        if (doc.location.length === 1) { // If there's only 1 file, then remove the whole thing.
                            
                            Movies.remove({_id: doc._id},
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
                            
                            
                            Movies.update({
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
        
        
        */




    });



}
