var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');
var Ticket   = require('../models/ticket');

var UserSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    email : {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password : {
        type: String,
        required: true
    }
});

//- ===================================
//- Generate a password hash
//- ===================================
UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//- ===================================
//- Check that the passwords match
//- ===================================
UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

//- ===================================
//- Ensure the data from the client is valid
//- ===================================
UserSchema.statics.IsValid = function (req) {
    var valid = true;

    if(!req.body.name || req.body.name === "") {
        req.flash('error', 'Name is required');
        valid = false;
    }

    if(!req.body.email || req.body.email === "") {
        req.flash('error', 'Email is required');
        valid = false;
    }

    if(!req.isAuthenticated()) {
        req.flash('error', 'Session timed out. Please log in again');
        valid = false;
    }

    return valid;
};

//- ===================================
//- Update an existing user
//- ===================================
UserSchema.statics.UpdateUser = function (req, callback) {
    var update = { 'name'    : req.body.name,
                   'email'   : req.body.email };

    this.findByIdAndUpdate(req.body.id, update, function (err) {
        if(err) {
            console.log('Error updating technician: ' + err);
            req.flash('error', 'An error occured. Please contact administrator');
        }
        else
            req.flash('success', update.name + ' updated succesfully');
        return callback();
    });
};

//- ===================================
//- Delete a user from the database
//- ===================================
UserSchema.statics.DeleteUser = function (req, callback) {
    if(!req.body.id || req.body.id === "") {
        req.flash('error', 'ID is required');
        return callback();
    }

    if(req.body.id == req.user._id) {
        req.flash('error', 'You are trying to delete yourself. Please don\'t.');
        return callback();
    }

    Ticket.findOne()
        .where('technician').equals(req.body.id)
        .exec(function (err, ticket) {
            if(err) {
                console.log('Error updating technician: ' + err);
                req.flash('error', 'An error occured. Please contact administrator');
                return callback();
            }

            if(ticket) {
                req.flash('error', 'A ticket is associated with this technician. Unable to delete');
                return callback();
            }

            mongoose.models.User.findByIdAndRemove (req.body.id, function (err) {
                if(err) {
                    console.log('Error deleting technician: ' + err);
                    req.flash('error', 'An error occured. Please contact administrator');
                }
                else
                    req.flash('success', 'Delete succesful');
                return callback();
            });

        });
};

// Export the UserSchema
module.exports = mongoose.model('User', UserSchema);