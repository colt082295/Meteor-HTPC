import videojs from 'video.js';
//import Select from 'select2';

var myVideo1;

Template.player.onRendered(function() {
    
    toastr.clear();
            toastr.remove();

        var location = Session.get("location");
        var time;
        var currentTime;
        myVideo1 = videojs("video")
        myVideo1.bigPlayButton.hide();
        myVideo1.loadingSpinner.show();
        
        
    // adding a button to the player
    //var button = myVideo1.addChild(myVideo1.createEl('div'));
    //button.el(); // -> button element

    //var myButton = myVideo1.addChild(content);

    // -> myButton === myComponent.children()[0];
    
    var html = Blaze.toHTML(Template.videoControl);
    
    console.log("template");
    console.log(html);
    
    
    var test = myVideo1.addChild('button', {
'el':videojs.createEl('div', { className:  'video-top',
      innerHTML: html})
});

/* get select2 working
    $("#quality-change").select2();
*/

    
    
    /*
    myVideo1.createEl = function( tagName, props ) {
        // Create the elements
 
        // This will become "this.el_"
        return overlay;
    };
    
    
    
    
    
    var overlay = myVideo1.createEl( 'div', {
            className: 'vjs-sharing-overlay'
        });
    myVideo1.addChild( overlay );
    
    
    */
    
    
    
    
    
   
   /*     
        
 var content = myVideo1.createEl('div', {
    className: 'testtttting',
    innerHTML: '<span class="more_testinng">TESTTTT </span>'
  });
  
  
  myVideo1.appendChild(myVideo1.createEl('div').appendChild(content));
  
  
  */
        
        
        
        myVideo1.ready(function() {
        
        //Blaze.render(Template.videoControl, $(".video-js")[0]);
        
        });

        var myVideo = document.createElement('video');
        
        
        


        if (myVideo.canPlayType('video/webm') && test) {
            var quality = $( "#quality-change" ).val();
            console.log("quality 1");
            console.log(quality);
            console.log("You can play webm");
            Meteor.call('streamWebm', location, quality, function(error, result) {
                if (error) {

                    console.log(error);

                }
                else {

                    console.log(result);
                    //videojs("video").ready(function(){
                    var player = myVideo1.ready(function() {
                        //var player = videojs('video', {  }, function() {
                        console.log('Good to go!');
                        

                        /*
                          
                        I have to figure out a way to pass the correct port for the video to the video player on the page.
                          
                        */
                        //this.bigPlayButton.hide();
                        //this.loadingSpinner.show();


                        // find out way to get loading spinner to show up so user knows something is happening.


                        //this.duration(result.duration);

                        // {"type":"application/x-mpegURL", "src":"http://167.114.103.80:2347/stream/stream.m3u8"},
                        this.src({
                            "type": "video/webm",
                            "src": "http://167.114.103.80:" + result.port
                        });
                        //this.duration(result.duration);
                        this.load();
                        //this.play();

                        // The duration gets screwed up for some reason, but if i pause the video once the page loads, the duration is right. Why?



                        this.on("playing", function() {
                            
                            $(".video_wrapper .spinner").hide();
                            
                            setTimeout(function(){
                                $( ".video-top" ).css({'visibility': 'hidden', 'opacity': 0});
                            }, 2000);
                            
                            
                        });
                        
                        
                        this.on("loadedmetadata", function() {

                            this.duration(result.duration);
                            this.play();
                            //this.loadingSpinner.hide();
                            $(".video_wrapper .spinner").hide();


                        });
                        
                        this.on('timeupdate', function(){
                            currentTime = player.currentTime();
                            Session.set("videoTime", currentTime);
                        });
                        
                        
                        $( "video" ).dblclick(function() {
                            
                            if (!player.isFullscreen()) {
                              player.requestFullscreen();
                            } else {
                              player.exitFullscreen();
                            }
                            
                        });
                        
                        
                        $('body').keyup(function(e){
                           if(e.keyCode == 32){
                               console.log("You pushed space! Blast off!!");
                               if (player.paused()) {
                                   player.play();
                               } else {
                                   player.pause();
                               }
                               
                           }
                        });
                        
                        this.on("pause", function() {
                            
                                $( ".video-top" ).css({'visibility': 'visible', 'opacity': 1});
                            
                            
                        });
                        
                        
                        
                        this.on("useractive", function() {
                            
                                $( ".video-top" ).css({'visibility': 'visible', 'opacity': 1});
                        });
                                                
                        this.on("userinactive", function() {
                            
                            //setTimeout(function(){
                                $( ".video-top" ).css({'visibility': 'hidden', 'opacity': 0});
                            //}, 500);
                          
                        });

                        this.on("seeking", function() {

                            console.log('seeking to ' + this.currentTime());
                            time = this.currentTime(); // Set time to the time you want to seek to

                            Meteor.call('streamSeekWebm', location, time, function(error, result) {
                                if (error) {

                                    console.log(error);

                                }
                                else {

                                    player.src({
                                        "type": "video/webm",
                                        "src": "http://167.114.103.80:" + result.port
                                    });
                                    player.load();
                                    //player.currentTime(time);
                                    //player.play();

                                }

                            });



                        });
                        
                        
                        
                        
                        
                        
                        
                        
           /*             
                        
                        
                        
                        this.on("progress",function(){ 
    if( player.duration() ) {    
        console.log(player.duration());
        var percent = (player.buffered().end(0)/player.duration()) * 100; 
        console.log(player.buffered());
        
        console.log("Percent buffered: " + percent);
        console.log( percent );    
        if( percent >= .05 ) {  
            console.log("loaded!");    
        }  
        
        //player.currentTime++;    
    }    
});
                        
                        
                    */    
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                   
                        
                        var lastTime = 0,
    lastBuffer = 0,
    buffered = false,
    bufferPause = false;

this.on("progress",function(){
      // As video downloads, check if the video is actually playing.
      // (this.paused() will return true even if it's buffering, so we have to check the time advancement)
      var currentTime = this.currentTime();
      console.log("The buffered percent is: " + this.bufferedPercent());

      if ( lastTime !== currentTime ) {
        // Update the lastTime if the time has changed.
        lastTime = currentTime;
        $(".video_wrapper .spinner").hide();
      } else if ( this.paused() === false ) {
        // Video is buffering/waiting.
        buffered = false;

        // If we haven't already paused the video, pause it so the video isn't attempting to replay all the time
        $(".video_wrapper .spinner").show();
        console.log("Pausing the video to wait for more of the video to buffer.");
        //this.pause();
        bufferPause = true; // To indicate pause was initiated by this buffer check

        
        
        // I want to do a check here to see if the video buffered twice or more times within 5 seconds. If so, display an alert telling the user that their bandwidth isn't good
        // enough for the current quality. Maybe I can run some some of bandwidth test that can calculate what bandwidth would be best?
        
        
        
        
        
        
        
        
        
        
        
        
        
      }
      
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

                }
                else {

                    console.log(result);
                    //videojs("video").ready(function(){
                    var player = myVideo1.ready(function() {

                        console.log('Good to go!');
                        this.bigPlayButton.hide();
                        this.src({
                            "type": "video/mp4",
                            "src": "http://167.114.103.80:" + result.port
                        });
                        this.load();

                        this.on("play", function() {

                            this.loadingSpinner.hide();

                        });

                        this.on("loadedmetadata", function() {

                            this.duration(result.duration);
                            this.play();
                            this.loadingSpinner.hide();


                        });
                        
                        this.on('timeupdate', function(){
                            currentTime = player.currentTime();
                            Session.set("videoTime", currentTime);
                        });
                        
                        $( "video" ).dblclick(function() {
                            
                            if (!player.isFullscreen()) {
                              player.requestFullscreen();
                            } else {
                              player.exitFullscreen();
                            }
                            
                        });
                        
                        this.on("useractive", function() {
                            $( ".video-top" ).css({'visibility': 'visible', 'opacity': 1});
                        });
                                                
                        this.on("userinactive", function() {
                          $( ".video-top" ).css({'visibility': 'hidden', 'opacity': 0});
                        });

                        this.on("seeking", function() {

                            console.log('seeking to ' + this.currentTime());
                            time = this.currentTime(); // Set time to the time you want to seek to

                            Meteor.call('streamSeekMp4', location, time, function(error, result) {
                                if (error) {

                                    console.log(error);

                                }
                                else {

                                    player.src({
                                        "type": "video/mp4",
                                        "src": "http://167.114.103.80:" + result.port
                                    });
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
        
        /*
        if($( ".video-js" ).hasClass( "vjs-user-inactive" )) {
            
            $( ".video-top" ).hide();
            
        }
        */
        
        //Blaze.renderWithData(Template.videoTop, {my: "data"}, $(".video-js")[0])


    });
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
        Template.player.events({
        
        
        'change #quality-change': function(event, template) {

            event.preventDefault();
            
            var quality = $("#quality-change").val();
            
            console.log("You changed the quality to: " + quality);
            
            //var myVideo1 = videojs("video")
            
            var location = this.location;
            var location1 = this;
            var location2 = template;
            console.log("template location");
            console.log(location);
            console.log(location1);
            console.log(location2);
            
            Meteor.call('streamWebm', location, quality, function(error, result) {
                if (error) {

                    console.log(error);

                }
                else {

                    console.log(result);

                        $(".video_wrapper .spinner").show();
                        console.log("myVideo1");
            console.log(myVideo1);
                        myVideo1.src({
                            "type": "video/webm",
                            "src": "http://167.114.103.80:" + result.port
                        });
                        
                        myVideo1.load();

                        myVideo1.on("loadedmetadata", function() {

                            myVideo1.duration(result.duration);
                            myVideo1.play();
                            $(".video_wrapper .spinner").hide();


                        });


                }


            });
            
            
            
            
            
            
            
            
            
            
            
            
            
        },
        

        'click #close': function(event, template) {

            event.preventDefault();
            
            myVideo1.pause();
            
            console.log("Closing player.");
            
            console.log(template);
            console.log(this);
            console.log(event);
            //videojs("video")
            
            var time = myVideo1.currentTime();
            console.log(myVideo1);
            console.log(time);
            
            if (this.format === "movie") {
            
            Meteor.call('updateMovieProgress', this._id, this.section, time, function(error, result) {
                if (error) {

                    console.log(error);

                }
                else {
                    
                    Blaze.remove(template.view);
                    myVideo1.dispose();
                    
                }
                
                
            });
            
            } else {
                
                
                Meteor.call('updateShowProgress', this._id, this.section, time, this.season, this.episode, function(error, result) {
                    if (error) {
    
                        console.log(error);
    
                    }
                    else {
                        
                        Blaze.remove(template.view);
                        myVideo1.dispose();
                        
                    }
                    
                    
                });
                
                
                
            }
            
            


        },



    });
    
    
    
    
    
    
    
    
    
    
    Template.player.onDestroyed(function() {

        //var oldPlayer = document.getElementById('video');
        //videojs(oldPlayer).dispose();
        //videojs("video").dispose();
        $("body").removeClass("overflow-hidden");
        console.log("Destroyed");
        myVideo1 = null;
        


    });