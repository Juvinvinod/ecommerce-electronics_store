const express = require('express');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const MongoStore = require('connect-mongo');

const routes = require('./routes/index');
const adminRoutes = require('./routes/adminRoute');
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

// cookieParser to store cookies
app.use(cookieParser(process.env.COOKIE));

// using session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: process.env.DATABASE }),
  })
);

// to send success/fail messages for displaying in the next page
app.use(flash());

// Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// storing different data in res
app.use((req, res, next) => {
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

// middleware to not store cache
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate');
  res.header('Expires', '0');
  res.header('Pragma', 'no-cache');
  next();
});

app.use('/', routes);
app.use('/admin', adminRoutes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
