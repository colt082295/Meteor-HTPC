var Future = Meteor.npmRequire('fibers/future');

Meteor.methods({

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
                ,
            filters: ["Temp", "_Temp"]

        };

        walker = walk.walk(folder, options);

        walker.on('directories', Meteor.bindEnvironment(function(root, dirStatsArray, next) {


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








});