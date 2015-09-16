var mongoose = require('mongoose');

var TicketSchema = new mongoose.Schema({
    client : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    date_created : {
        type: Date,
        required: true
    },
    service_type : {
        type: String,
        required: true
    },
    description : {
        type: String
    },
    technician : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invoice : {
        type: String
    },
    status : {
        type: String,
        required: true
    },
    updates : [{
        body : String,
        date : Date
    }],
    created_by : {
        type: String,
        required: true
    }
});

//- ===================================
//- Ensures the data from the client is valid
//- ===================================
TicketSchema.statics.IsValid = function (req) {
    var valid = true;

    if (!req.body.client || req.body.client === "") {
        req.flash('error', 'Client name is required');
        valid = false;
    }

    if (!req.body.date_created || req.body.date_created === "") {
        req.flash('error', 'Date created is required');
        valid = false;
    }

    if (!req.body.service || req.body.service === "") {
        req.flash('error', 'Service type is required');
        valid = false;
    }

    if (!req.body.technician || req.body.technician === "") {
        req.flash('error', 'Technician name is required');
        valid = false;
    }

    if (!req.body.status || req.body.status === "") {
        req.flash('error', 'Status is required');
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
TicketSchema.statics.CreateTicket = function (req, ticket, callback) {
    ticket.save(function (err) {
        if (err) {
            console.log('Error creating ticket: ' + err);
            req.flash('error', 'An error occured. Please contact administrator');
        } else {
            req.flash('success', 'Ticket created succesfully');
        }
        return callback();
    });
};

//- ===================================
//- Update an existing ticket
//- ===================================
TicketSchema.statics.UpdateTicket = function (req, id, update, callback) {
    this.findByIdAndUpdate(id, update, function (err) {
        if (err) {
            console.log('Error updating ticket: ' + err);
            req.flash('error', 'An error occured. Please contact administrator');
        } else {
            req.flash('success', 'Ticket updated succesfully');
        }
        return callback();
    });
};

//- ===================================
//- Delete a ticket from the database
//- ===================================
TicketSchema.statics.DeleteTicket = function (req, callback) {
    if (!req.body.id || req.body.id === "") {
        req.flash('error', 'ID is required');
        return callback();
    }

    this.findByIdAndRemove(req.body.id, function (err) {
        if (err) {
            console.log('Error deleting ticket: ' + err);
            req.flash('error', 'An error occured. Please contact administrator');
        } else {
            req.flash('success', 'Delete succesful');
        }
        return callback();
    });
};

// Export the TicketSchema
module.exports = mongoose.model('Ticket', TicketSchema);