Router.map(function(){
    // This routes the template to a specificed link
    this.route('home', {path: '/'} );
});

/*
Router.route('/section/:_id', { // Route to template to the specified link, and pull the id from the Mongodb collection.
  name: 'content', // This links to the template
  waitOn: function() {
        return Meteor.subscribe('sections');
      },
      data: function() {
        return Sections.findOne(this.params._id);
      },
      fastRender: true,
      cache: 5, //cache 5 blog posts
    expire: 3 //expire them if inactive for 3 minutes
});
*/

Router.route('/movies', { // Route to template to the specified link, and pull the id from the Mongodb collection.
  name: 'movies', // This links to the template
  waitOn: function() {
        return Meteor.subscribe('movies');
      },
      data: function() {
        return {
        movie : Moviess.find({}, {sort: {name: 1}})}
      },
      fastRender: true,
      cache: 5, //cache 5 blog posts
    expire: 3 //expire them if inactive for 3 minutes
});

Router.route('/section/:_id', { // Route to template to the specified link, and pull the id from the Mongodb collection.
  name: 'section', // This links to the template
  waitOn: function() {
        return Meteor.subscribe('section', this.params._id);
      },
      data: function() {
        return Sections.findOne(this.params._id)
      },
      fastRender: true,
      cache: 5, //cache 5 blog posts
    expire: 3 //expire them if inactive for 3 minutes
});
/*

Router.route('/shows/:_id', { // Route to template to the specified link, and pull the id from the Mongodb collection.
  name: 'shows', // This links to the template
  waitOn: function() {
        return Meteor.subscribe('tv', this.params._id);
      },
      data: function() {
        return Tv.findOne(this.params._id)
      },
      fastRender: true,
      cache: 5, //cache 5 blog posts
    expire: 3 //expire them if inactive for 3 minutes
});
*/

// Route to specific page to edit the client
Router.route('/section/:section/movie/:_id', { // Route to template to the specified link, and pull the id from the Mongodb collection.
  name: 'viewMoviePage', // This links to the template
  waitOn: function() {
      return Meteor.subscribe('movie_info', this.params._id, this.params.section);
  },
  data: function() { return Moviess.findOne({_id:this.params._id, section: this.params.section}); }, // This returns the id for the specified item
  fastRender: true,
  cache: 5, //cache 5 blog posts
    expire: 3 //expire them if inactive for 3 minutes
});

Router.route('/section/:section/show/:_id', { // Route to template to the specified link, and pull the id from the Mongodb collection.
  name: 'viewShowPage', // This links to the template
  waitOn: function() {
      return Meteor.subscribe('tv_info', this.params._id, this.params.section);
  },
  data: function() { return Tv.findOne({_id:this.params._id, section: this.params.section}); }, // This returns the id for the specified item
  fastRender: true,
  cache: 5, //cache 5 blog posts
    expire: 3 //expire them if inactive for 3 minutes
});

Router.route('/section/:section/show/:_id/season/:season_number', {
      name: 'viewSeasonPage', // This links to the template
      waitOn: function() {
      return Meteor.subscribe('tv_info', this.params._id, this.params.section);
  },
      data: function() { 
        var season_number = this.params.season_number;
        
               var tv = Tv.findOne({_id:this.params._id, section:this.params.section});
               if (tv && tv.seasons) { 
                   
                 return tv.seasons.find(function(season) {
                   
                   if (season.season_number == season_number) { 
                     
                     console.log("Found! The season number is: " + season_number);
                     return this; 
                     
                   }
                 
               })
            
                 
               } else {
                console.log("Seasons not there yet!");
        }
    
    
    /*
    This one somewhat works
    
    data: function() { 
        var id = this.params._id;
        var season_number = this.params.season_number;
        var tv = Tv.findOne({_id:this.params._id});
        if (tv && tv.seasons) { console.log("Found seasons!");
          return tv.seasons.find(function(season) { return season.season_number == 2; });
          
        } else {
          console.log("Seasons not there yet!");
        }
      
            
    }
    
    
    
    
    */
  
  /* other way - in the spacebars pathfor with iron router you also have to pass the array index in the {{#each}} loop. And for some reason
  it has to be included in the actual route.
  
  var show = Tv.findOne({
       _id: this.params._id
  });
  
  var view_data = {
    id: this.params._id,
    season_number: this.params.season_number,
    season: show.seasons[this.params.index]
  }
  
  return view_data;
  
  
  */
  
  
},
fastRender: true,
    cache: 5, //cache 5 blog posts
    expire: 3 //expire them if inactive for 3 minutes
}
); 

Router.route("/actor/:name", {
  name: "viewActorPage",
  
  action: function() {
    //this.render("viewActorPage")
    if (this.ready()) {
        this.render();
    }
  },
  waitOn: function() {
    // Call the async function, with an optional data argument
    return Util.waitOnServer("searchPerson", this.params.name);
  },
  data: function() { 
    
    if (this.ready()) {
        return Util.getResponse("searchPerson");
    }
    
    
  },
  fastRender: true,
  
});

Router.route("/player", {
  name: "player",
  data: function() { 
    
    return {port: Session.get("port") };
    
    
  },
  fastRender: true,
  
})