require('dotenv').config()

const createError = require('http-errors')
const path = require('path')
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const logger = require('morgan')
const fetch = require('node-fetch')


const indexRouter = require('./routes/index')
const authRouter = require('./routes/passport');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Define twitch api constants
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;  // You can run locally with - http://localhost:3000/auth/twitch/callback
// These two don't really need to be kept secret since it's part of the public twitch API
// methods but just in case we need to use them more than once it makes it easier to reference
const AUTHORIZATION_URL = process.env.AUTHORIZATION_URL
const TOKEN_URL = process.env.TOKEN_URL

// Initialize Express and middlewares
app.use(logger('dev'))
app.use(express.json())
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());

// Routes ect
app.use('/', indexRouter)

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});


app.use('/auth', authRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function () {
	console.log('Twitch streamers listening on port 3000!')
});