var Future = Meteor.npmRequire('fibers/future');

Meteor.methods({

    streamMp4: function(path) {

        this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });



        var http = Meteor.npmRequire('http');
        var fs = Meteor.npmRequire('fs');
        var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        var portfinder = Meteor.npmRequire('portfinder');
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



    streamWebm: function(path) {

        this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });



        var http = Meteor.npmRequire('http');
        var fs = Meteor.npmRequire('fs');
        var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        var portfinder = Meteor.npmRequire('portfinder');
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
                            .addOptions(['-qmin 10', '-qmax 42', '-quality good', '-crf 20', '-cpu-used -6', '-threads 0', '-f webm', '-deadline realtime'])
                            .withVideoBitrate(2200)
                            .withAudioCodec('libvorbis')
                            .audioBitrate('128k')
                            .audioChannels(2)
                            .fps(24)
                            .withSize('1280x720')
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
                    //future.return({port:port, duration: metadata.format.duration});


                });



            }
        });


        return future.wait();


    },




    streamSeekWebm: function(path, seek) {

        this.unblock();

        notifications.permissions.read(function(userId, eventName) {
            return true;
        });



        var http = Meteor.npmRequire('http');
        var fs = Meteor.npmRequire('fs');
        var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        var portfinder = Meteor.npmRequire('portfinder');
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



        var http = Meteor.npmRequire('http');
        var fs = Meteor.npmRequire('fs');
        var ffmpeg = Meteor.npmRequire('fluent-ffmpeg');
        var portfinder = Meteor.npmRequire('portfinder');
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