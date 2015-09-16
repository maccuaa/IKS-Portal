//- ===================================
//- Module Dependencies
//- ===================================
var http          = require('http');
var engine        = require('jade');
var express       = require('express');
var flash         = require('connect-flash');
var mongoose      = require('mongoose');
var passport      = require('passport');
var MongoStore    = require('connect-mongo')(express);
var app           = express();

require('./config/passport')(passport);

//- ===================================
//- Set Environment variables
//- ===================================
//app.set('env', 'development');
app.set('env', 'production');
app.set('port', process.env.PORT || 3000);
app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.favicon('./public/img/favicon.ico'));
app.use(express.static('./public'));

//- ===================================
//- Connect to Database
//- ===================================
mongoose.connect('mongodb://localhost/IKS-Portal');

//- ===================================
//- Configure Middleware
//- ===================================
app.configure(function () {
    app.use(express.compress());
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.methodOverride());
    app.use(express.cookieParser('IKS super secret cookie!'));
    app.use(express.session({
        cookie: {maxAge: 60000 * 20},
        secret: "",
        store: new MongoStore({
            db: "Sessions",
            mongoose_connection: mongoose.connections[0]}),
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    app.use(app.router);

    if ('development' === app.get('env')) {
        app.use(express.errorHandler());
        app.use(express.logger('dev'));
    }
});

//- ===================================
//- Load Routes
//- ===================================
require('./app/routes.js')(app, passport);


//- ===================================
//- Start the Database and Webserver
//- ===================================
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Mongo connection error:'));
db.once('open', function callback() {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port') + ' in ' + app.get('env') + ' mode.');
    });
});
