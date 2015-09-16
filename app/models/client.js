var mongoose   = require('mongoose');
var Ticket     = require('../models/ticket');

var ClientSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    email : {
        type: String
    },
    phone : {
        type: String
    },
    city : {
        type: String,
        required: true
    },
    address : {
        type: String,
    },
    date_created : {
        type: Date,
        default: Date.now
    },
    created_by : {
        type : String,
        required: true
    }
});

//- ===================================
//- Ensures the data from the client is valid
//- ===================================
ClientSchema.statics.IsValid = function (req) {
    var valid = true;

    if (!req.body.name || req.body.name === "") {
        req.flash('error', 'Name is required');
        valid = false;
    }

    if (!req.body.city || req.body.city === "") {
        req.flash('error', 'City is required');
        valid = false;
    }

    if (!req.isAuthenticated()) {
        req.flash('error', 'Session timed out. Please log in again');
        valid = false;
    }

    return valid;
};

//- ===================================
//- Add a client to the database
//- ===================================
ClientSchema.statics.CreateClient = function (req, newClient, callback) {
    this.findOne({name : req.body.name}).exec(function (err, client) {
        if (err) {
            console.log('Error creating client: ' + err);
            req.flash('error', 'An error occured. Please contact administrator');
            return callback();
        }

        if (!client) {
            newClient.name       = req.body.name;
            newClient.email      = req.body.email;
            newClient.phone      = req.body.phone;
            newClient.city       = req.body.city;
            newClient.address    = req.body.address;
            newClient.created_by = req.user.name;

            newClient.save(function (err) {
                if (err) {
                    console.log('Error creating client: ' + err);
                    req.flash('error', 'An error occured. Please contact administrator');
                } else {
                    req.flash('success', newClient.name + ' created succesfully');
                }
                return callback();
            });
        } else {
            req.flash('error', 'Sorry. A client with that name already exists');
            return callback();
        }
    });
};

//- ===================================
//- Update an existing client
//- ===================================
ClientSchema.statics.UpdateClient = function (req, callback) {
    var update = { 'name'    : req.body.name,
                   'email'   : req.body.email,
                   'phone'   : req.body.phone,
                   'city'    : req.body.city,
                   'address' : req.body.address };

    this.findByIdAndUpdate(req.body.id, update, function (err) {
        if (err) {
            console.log('Error updating client: ' + err);
            req.flash('error', 'An error occured. Please contact administrator');
        } else {
            req.flash('success', update.name + ' updated succesfully');
        }
        return callback();
    });
};

//- ===================================
//- Delete a client from the database
//- ===================================
ClientSchema.statics.DeleteClient = function (req, callback) {
    if (!req.body.id || req.body.id === "") {
        req.flash('error', 'ID is required');
        return callback();
    }

    Ticket.findOne()
        .where('client').equals(req.body.id)
        .exec(function (err, ticket) {
            if (err) {
                console.log('Error updating client: ' + err);
                req.flash('error', 'An error occured. Please contact administrator');
                return callback();
            }

            if (ticket) {
                req.flash('error', 'A ticket is associated with this client. Unable to delete');
                return callback();
            }

            mongoose.models.Client.findByIdAndRemove(req.body.id, function (err) {
                if (err) {
                    console.log('Error deleting client: ' + err);
                    req.flash('error', 'An error occured. Please contact administrator');
                } else {
                    req.flash('success', 'Delete succesful');
                }
                return callback();
            });
        });
};

// Export the ClientSchema
module.exports = mongoose.model('Client', ClientSchema);