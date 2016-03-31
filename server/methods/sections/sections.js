var Future = Meteor.npmRequire('fibers/future');

Meteor.methods({


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
        }, {
            name: name,
            location: location,
            format: format,
        });

    },

    removeSections: function() {

        Sections.remove({});

    },

    removeSection: function(id) {

        var section = Sections.findOne({
            _id: id
        });



        if (section.format === "movies") {

            Moviess.remove({
                section: id
            });

        }
        else if (section.format === "shows") {

            Tv.remove({
                section: id
            });

        }
        else {

        }

        Sections.remove(section);


    },


});