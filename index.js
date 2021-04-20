require('dotenv').config()

const createError = require('http-errors')
const path = require('path')
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const logger = require('morgan')

// routes
const indexRouter = require('./routes/index')
const authRouter = require('./routes/passport');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const SESSION_SECRET = process.env.SESSION_SECRET;

// Initialize Express and middlewares
app.use(logger('dev'))
app.use(express.json())
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use('/css', express.static(path.join(__dirname, '/css')));
app.use(cookieParser(SESSION_SECRET))
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

app.get('/logout', function(req, res){
  req.logout();
	res.clearCookie('userData').redirect('/');
});

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