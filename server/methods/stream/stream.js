import Future from 'fibers/future';

import MovieDB1 from 'moviedb';
var MovieDB = new MovieDB1('23290308516dcbfcb67fb0f330028492');

import walk from 'walkdir';
import fs from 'fs';
import mime from 'mime';
import path from 'path';


import TVDB from 'node-tvdb/compat';
var tvdb = new TVDB('79403F2E528405DB');

import http from 'http';
import ffmpeg from 'fluent-ffmpeg';
import portfinder from 'portfinder';

Meteor.methods({

    streamMp4: function(path) {

        this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });


        /*
        var http = Meteor.npmRequire('http');
        var fs = Meteor.npmRequire('fs');
        var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        var portfinder = Meteor.npmRequire('portfinder');
        */
        var future = new Future();


        ffmpeg.ffprobe(path, function(err, metadata) {


            if (err) {
                notifications.emit('message', 'Video error');
            }
            else {

                portfinder.getPort(function(err, port) {


                    http.createServer(function(req, res) {

                        console.log("encoding movie", path);
                        notifications.emit('message', metadata);
                        ffmpeg({
                          source: path,
                          timeout: 0
                        })



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
                    future.return({
                        port: port,
                        duration: metadata.format.duration
                    });
                    //future.return({port:port, duration: metadata.format.duration});


                });



            }
        });


        return future.wait();

    },



    streamWebm: function(path, quality) {

        this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });
        
        notifications.emit('message', "quality");
                        notifications.emit('message', quality);


        /*
        var http = Meteor.npmRequire('http');
        var fs = Meteor.npmRequire('fs');
        var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        var portfinder = Meteor.npmRequire('portfinder');
        */
        var future = new Future();


        ffmpeg.ffprobe(path, Meteor.bindEnvironment(function(err, metadata) {


            if (err) {
                notifications.emit('message', 'Video error');
            }
            else {

                portfinder.getPort(Meteor.bindEnvironment(function(err, port) {


                    http.createServer(Meteor.bindEnvironment(function(req, res) {

                        console.log("encoding movie", path);
                        notifications.emit('message', metadata);
                        
                        /*
                        
                        var quality1 = Meteor.myFunctions.qualityCheck(quality);
                        
                        notifications.emit('message', "quality 3");
                        notifications.emit('message', quality1);
                        
                        */
                        
                        /*
                        
                        var range = req.headers.range;
                        
                        
                        
                        var positions = range.replace(/bytes=/, "").split("-");
      var start = parseInt(positions[0], 10);
      var total = metadata.format.size;
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      var chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/webm"
      });
      */
      
      var total = metadata.format.size;
      var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total-1;
    var chunksize = (end-start)+1;
    //console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

    //var file = fs.createReadStream(path, {start: start, end: end});
    res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/webm' });
                        //notifications.emit('message', res);
                        
                        
                        
                        
                        
                        
                        ffmpeg({
                          source: path,
                          timeout: 0
                        })
                        
                        .withVideoCodec('libvpx')
                            .addOptions(['-qmin 10', '-qmax 42', '-quality good', '-crf 20', '-cpu-used -6', '-threads 0', '-f webm', '-deadline realtime'])
                            .withVideoBitrate(2200)
                            .withAudioCodec('libvorbis')
                            .audioBitrate('128k')
                            .audioChannels(2)
                            .fps(24)
                            
                            .withSize(quality)
                            .format('webm')
                            

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


                    })).listen(port);
                    console.log("video stream running on port: " + port);
                    future.return({
                        port: port,
                        duration: metadata.format.duration
                    });
                    //future.return({port:port, duration: metadata.format.duration});


                }));



            }
        }));


        return future.wait();


    },




    streamSeekWebm: function(path, seek) {

        this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });


        /*
        var http = Meteor.npmRequire('http');
        var fs = Meteor.npmRequire('fs');
        var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        var portfinder = Meteor.npmRequire('portfinder');
        */
        var future = new Future();

        ffmpeg.ffprobe(path, function(err, metadata) {


            if (err) {
                notifications.emit('message', 'Video error');
            }
            else {

                portfinder.getPort(function(err, port) {


                    http.createServer(function(req, res) {

                        console.log("encoding movie", path);
                        notifications.emit('message', metadata);



                        ffmpeg({
                          source: path,
                          timeout: 0
                        })


                        .withVideoCodec('libvpx')
                            .addOptions(['-qmin 0', '-qmax 50', '-crf 5', '-quality good', '-cpu-used -6', '-threads 0', '-f webm', '-reserve_index_space 512', '-deadline realtime'])
                            .withVideoBitrate(2200)
                            .withAudioCodec('libvorbis')
                            .withSize('1280x720')
                            .seekInput(seek)
                            .format('webm')

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
                    future.return({
                        port: port,
                        duration: metadata.format.duration
                    });


                });

            }
        });



        return future.wait();

    },
    
    
    
    
        streamSeekMp4: function(path, seek) {

        this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });


        /*
        var http = Meteor.npmRequire('http');
        var fs = Meteor.npmRequire('fs');
        var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        var portfinder = Meteor.npmRequire('portfinder');
        */
        var future = new Future();

        ffmpeg.ffprobe(path, function(err, metadata) {


            if (err) {
                notifications.emit('message', 'Video error');
            }
            else {

                portfinder.getPort(function(err, port) {


                    http.createServer(function(req, res) {

                        console.log("encoding movie", path);
                        notifications.emit('message', metadata);



                        ffmpeg({
                          source: path,
                          timeout: 0
                        })


                        .withVideoCodec('libx264')
                            .addOptions(['-crf 24', '-movflags frag_keyframe+empty_moov', '-preset ultrafast']) // -movflags frag_keyframe+empty_moov   -movflags +faststart    Might use a different flag to move the metadata to the front.
                            .withVideoBitrate(2200)
                            .withAudioCodec('libfdk_aac')
                            .audioBitrate('128k')
                            .audioChannels(2)
                            .fps(24)
                            .withSize('1280x720')
                            .format('mp4')

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
                    future.return({
                        port: port,
                        duration: metadata.format.duration
                    });


                });

            }
        });



        return future.wait();

    },



});