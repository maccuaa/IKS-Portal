//- ===================================
//- Load Database Schemas
//- ===================================
var User   = require ('../app/models/user');
var Client = require ('../app/models/client');
var Ticket = require ('../app/models/ticket');

var moment = require ('moment');

module.exports = function (app, passport) {
    //- ===================================
    //- Root - GET
    //- ===================================
    app.get ('/', redirectLoggedIn, function (req, res) {
        res.redirect('/login');
    });

    //- ==============================
    //- Login - GET / POST
    //- ==============================
    app.get ('/login', redirectLoggedIn, function (req, res) {
        res.render ('login', {
            errorMessages : req.flash ('error')
        });
    });
    app.post ('/login', redirectLoggedIn, passport.authenticate ('local-login', {
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash : true
    }));

    //- ==============================
    //- Register - GET / POST
    //- ==============================
    app.get ('/register', redirectLoggedIn, function (req, res) {
        res.render ('register', {
            errorMessages : req.flash ('error')
        });
    });
    app.post ('/register', redirectLoggedIn, passport.authenticate ('local-register', {
        successRedirect : '/dashboard',
        failureRedirect : '/register',
        failureFlash : true
    }));

    //- ==============================
    //- Dashboard - GET
    //- ==============================
    app.get  ('/dashboard', ensureLoggedIn, function (req, res) {
        res.render ('dashboard', {
            user : req.user,
            errorMessages : req.flash ('error'),
            successMessages : req.flash ('success') });
    });

    //- ===================================
    //- Dashboard - AJAX - Create Client
    //- ===================================
    app.post ('/dashboard/create_client', function (req, res) {
        if (Client.IsValid (req)) {
            Client.CreateClient (req, new Client(), function () {
                return res.send (req.flash ());
            });
        }
        else {
            return res.send (req.flash ());
        }
    });

    //- ===================================
    //- Dashboard - AJAX - Edit Client
    //- ===================================
    app.post ('/dashboard/edit_client', function (req, res) {
        if (Client.IsValid (req)) {
            Client.UpdateClient (req, function () {
                return res.send (req.flash ());
            });
        }
        else {
            return res.send (req.flash ());
        }
    });

    //- ===================================
    //- Dashboard - AJAX - Delete Client
    //- ===================================
    app.post ('/dashboard/delete_client', function (req, res) {
        Client.DeleteClient (req, function () {
            return res.send (req.flash ());
        });
    });

    //- ===================================
    //- Dashboard - AJAX - Load client table
    //- ===================================
    app.get ('/dashboard/load_clients', function (req, res) {
        Client.find ()
            .sort({name : 1})
            .exec (function (err, clients) {
                if (err)
                    console.log (err);
                res.render ('clients-table', {clients : clients});
            });
    });

    //- ===================================
    //- Dashboard - AJAX - Create Ticket
    //- ===================================
    app.post ('/dashboard/create_ticket', function (req, res) {
        var response    = {};
        var client_done = false;
        var user_done   = false;

        var callback = function () {
            if (client_done && user_done) {
                if (!response.client)
                        req.flash ('error', 'Client not found.');
                if (!response.user)
                    req.flash ('error', 'Technician not found');

                if (response.user && response.client) {
                        var newTicket          = new Ticket ();

                        newTicket.client       = response.client._id;
                        newTicket.date_created = moment (req.body.date_created, "DD MMM YYYY").toISOString ();
                        newTicket.service_type = req.body.service;
                        newTicket.description  = req.body.description;
                        newTicket.technician   = response.user._id;
                        newTicket.status       = req.body.status;
                        newTicket.invoice      = req.body.invoice;
                        newTicket.created_by   = req.user.name;

                        Ticket.CreateTicket (req, newTicket, function () {
                            return  res.send (req.flash ());
                        });
                    }
                else {
                    return res.send (req.flash ());
                }
            }
        };

        if (Ticket.IsValid (req)) {
            Client.findOne ({ 'name' :  req.body.client })
                .exec (function (err, client) {
                    if (err)
                        console.log (err);
                    response.client = client;
                    client_done = true;
                    callback ();
                });

            User.findOne ({ 'name' : req.body.technician})
                .exec (function (err, user) {
                    if (err)
                        console.log (err);

                    response.user = user;
                    user_done = true;
                    callback ();
                });
        }
        else {
            return res.send (req.flash ());
        }
    });

    //- ===================================
    //- Dashboard - AJAX - Edit Ticket
    //- ===================================
    app.post ('/dashboard/edit_ticket', function (req, res) {
        var response    = {};
        var client_done = false;
        var user_done   = false;

        var callback = function () {
            if (client_done && user_done) {
                if (!response.client)
                        req.flash ('error', 'Client not found.');
                if (!response.user)
                    req.flash ('error', 'Technician not found');

                if (response.user && response.client) {
                    var update = { 'client'       : response.client._id,
                                   'date_created' : moment (req.body.date_created, "DD MMM YYYY").toISOString (),
                                   'service_type' : req.body.service,
                                   'description'  : req.body.description,
                                   'technician'   : response.user._id,
                                   'status'       : req.body.status,
                                   'invoice'      : req.body.invoice,
                                   'created_by'   : req.user.name };

                    Ticket.UpdateTicket (req, req.body.id, update, function () {
                        return res.send (req.flash ());
                    });
                }
                else {
                    return res.send (req.flash ());
                }
            }
        };

        if (Ticket.IsValid (req)) {
            Client.findOne ({ 'name' :  req.body.client })
                .exec (function (err, client) {
                    if (err)
                        console.log (err);
                    response.client = client;
                    client_done = true;
                    callback ();
                });

            User.findOne ({ 'name' : req.body.technician})
                .exec (function (err, user) {
                    if (err)
                        console.log (err);

                    response.user = user;
                    user_done = true;
                    callback ();
                });
        }
        else {
            return res.send (req.flash ());
        }
    });

    //- ===================================
    //- Dashboard - AJAX - Delete Ticket
    //- ===================================
    app.post ('/dashboard/delete_ticket', function (req, res) {
        Ticket.DeleteTicket (req, function () {
            return res.send (req.flash ());
        });
    });

    //- ===================================
    //- Dashboard - AJAX - Load ticket table
    //- ===================================
    app.get ('/dashboard/load_tickets', function (req, res) {
        Ticket.find ()
            .populate ('client')
            .populate ('technician')
            .sort ({date_created : 1})
            .exec (function (err, tickets) {
                if (err)
                    console.log (err);
                res.render ('tickets-table', {tickets : tickets, moment : moment});
            });
    });

    //- ===================================
    //- Dashboard - AJAX - Edit User
    //- ===================================
    app.post ('/dashboard/edit_user', function (req, res) {
        if (User.IsValid (req)) {
            User.UpdateUser (req, function () {
                return res.send (req.flash ());
            });
        }
        else {
            return res.send (req.flash ());
        }
    });


    //- ===================================
    //- Dashboard - AJAX - Delete Ticket
    //- ===================================
    app.post ('/dashboard/delete_user', function (req, res) {
        User.DeleteUser (req, function () {
            return res.send (req.flash ());
        });
    });

    //- ===================================
    //- Dashboard - AJAX - Load user table
    //- ===================================
    app.get ('/dashboard/load_users', function (req, res) {
        User.find ()
            .sort ({name : 1})
            .exec (function (err, users) {
                if (err)
                    console.log (err);
                res.render ('user-table', {users: users});
            });
    });

    //- ===================================
    //- Dashboard - AJAX - Get people
    //- ===================================
    app.get ('/dashboard/get_people', function (req, res) {
        var response     = {};
        var clients_done = false;
        var users_done   = false;

        var callback = function () {
            if (clients_done && users_done)
                res.send (response);
        };

        Client.find ()
            .sort({name : 1})
            .select ('name')
            .exec (function (err, clients) {
                if (err)
                    console.log (err);
                response.clients = clients;
                clients_done = true;
                callback ();
            });
        User.find ()
            .sort({name : 1})
            .select ('name')
            .exec (function (err, users) {
                if (err)
                    console.log (err);
                response.technicians = users;
                users_done = true;
                callback ();
            });
    });

    //- ===================================
    //- Logout - GET
    //- ===================================
    app.get ('/logout', function (req, res) {
        req.logout ();
        res.redirect ('/');
    });

    //- ===================================
    //- Anything else - GET / POST
    //- ===================================
    app.all ('*', function (req, res) {
        req.flash('error', "Whoops! We seem to have misplaced that page.");
        res.redirect('/');
    });
};

//- ===================================
//- Ensures the user is logged in
//- ===================================
function ensureLoggedIn (req, res, next){
    if (req.isAuthenticated ())
        return next();
    req.flash ('error', 'Please login in to continue.');
    res.redirect('/login');
}

//- ===================================
//- Redirects if user is logged in
//- ===================================
function redirectLoggedIn (req, res, next) {
    if (req.isAuthenticated ())
        return res.redirect('/dashboard');
    next();
}