const express = require('express');
const session = require('express-session');
const path = require('path');

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

// done! we export it so we can start the site in start.js
module.exports = app;
