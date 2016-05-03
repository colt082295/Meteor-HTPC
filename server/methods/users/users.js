import Future from 'fibers/future';

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
    
});