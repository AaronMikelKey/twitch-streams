require('dotenv').config()

var express = require('express');
var router = express.Router();
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

// Define twitch api constants
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;
// These two don't really need to be kept secret since it's part of the public twitch API
// methods but just in case we need to use them more than once it makes it easier to reference
const AUTHORIZATION_URL = process.env.AUTHORIZATION_URL
const TOKEN_URL = process.env.TOKEN_URL

passport.use('twitch', new OAuth2Strategy({
	authorizationURL: AUTHORIZATION_URL || 'https://id.twitch.tv/oauth2/authorize',
	tokenURL: TOKEN_URL || 'https://id.twitch.tv/oauth2/token',
	clientID: TWITCH_CLIENT_ID,
	clientSecret: TWITCH_SECRET,
	callbackURL: CALLBACK_URL,
	state: true
},
	function (accessToken, refreshToken, profile, done) {
		profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;

		// Securely store user profile in your DB
		//User.findOrCreate(..., function(err, user) {
		//  done(err, user);
		//});

		done(null, profile);
	}
));


// Set route to start OAuth link, this is where you define scopes to request
router.get('/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

// Set route for OAuth redirect
router.get('/twitch/callback', passport.authenticate('twitch', { successRedirect: '/user', failureRedirect: '/' }));



module.exports = router;