const express = require('express');
const session = require('express-session');
const path = require('path');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const MongoStore = require('connect-mongo');

const routes = require('./routes/index');
const errorHandlers = require('./handlers/errorHandlers');
require('./handlers/passport');

// create our Express app
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our ejs files
app.set('view engine', 'ejs'); // we use the engine ejs

// serves up static files from the public folder.
app.use(express.static(path.join(__dirname, 'public')));

// Takes the raw requests and turns them into usable properties on req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressValidator());

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: process.env.DATABASE }),
  })
);

// Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

app.use('/', routes);

module.exports = app;
