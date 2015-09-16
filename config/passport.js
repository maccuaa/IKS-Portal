var LocalStrategy   = require ('passport-local').Strategy;
var User            = require ('../app/models/user');

module.exports = function (passport) {

    //- ===================================
    //- Serialize the user for the session store
    //- ===================================
    passport.serializeUser (function(user, done) {
        done (null, user.id);
    });

    //- ===================================
    //- Deserialize the user
    //- ===================================
    passport.deserializeUser (function (id, done) {
        User.findById (id, function (err, user) {
            done (err, user);
        });
    });

    //- ===================================
    //- User Registration
    //- ===================================
    passport.use ('local-register', new LocalStrategy ({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function (req, email, password, done) {

        var valid  = true;
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        if (!req.body.name || req.body.name === "") {
            req.flash ('error', 'Name is required');
            valid = false;
        }

        if (!req.body.email || req.body.email === "") {
            req.flash ('error', 'Email is required');
            valid = false;
        }
        else if (!filter.test (req.body.email)) {
            req.flash ('error', 'Email is invalid');
            valid = false;
        }

        if (!req.body.password || req.body.password === "") {
            req.flash ('error', 'Password is required');
            valid = false;
        }
        else if (req.body.password.length < 6 || req.body.password.length > 20) {
            req.flash ('error', 'Password must be 6-20 characters long');
            valid = false;
        }

        if (!valid)
            return done (null, false);

        process.nextTick (function () {
            User.findOne ()
            .or ([
                    {name: req.body.name},
                    {email:  email }
                ])
            .exec (function (err, user) {
                if (err) {
                    console.log ('Error creating user: ' + err);
                    return done (null, false, req.flash ('error', 'An error occured. Please contact administrator'));
                }

                // check if email exists already
                if (!user) {
                    var newUser      = new User();
                    newUser.name     = req.body.name;
                    newUser.email    = email;
                    newUser.password = newUser.generateHash (password);
                    newUser.save(function(err) {
                        if (err) {
                            console.log ('Error creating client: ' + err);
                            return done (null, false, req.flash ('error', 'An error occured. Please contact administrator'));
                        }
                        return done (null, newUser);
                    });
                }
                else {
                    if (user.name === req.body.name)
                        return done (null, false, req.flash ('error', 'Sorry. That name is already taken.'));
                    if (user.email === email)
                        return done (null, false, req.flash ('error', 'Sorry. That email is already taken.'));
                }
            });
        });
    }));

    //- ===================================
    //- User Login
    //- ===================================
    passport.use ('local-login', new LocalStrategy ({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function (req, email, password, done) {
        process.nextTick (function () {
            User.findOne ({ 'email' :  email }, function (err, user) {
                if (err)
                    return done (err);

                if (!user)
                    return done (null, false, req.flash ('error', 'Email not found.'));

                if (!user.validPassword(password))
                    return done (null, false, req.flash ('error', 'Incorrect password'));

                return done (null, user);
            });
        });
    }));
};