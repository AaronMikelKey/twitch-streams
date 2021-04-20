# Twitch API example

This is a simple project I made to show a little info about your twitch follows that are streaming. If you have any follows that are streaming now it will show their name, stream title, viewer count, and a thumbnail of the stream.

If you would like to try this yourself, you will need to visit the [https://dev.twitch.tv](Twitch Developer website) and create an account. Create a new app and get the following:

| key | value |
| **TWITCH_CLIENT_ID** | provided by twitch |
| **TWITCH_SECRET** | provided by twitch |
| **CALLBACK_URL** | set by you e.g. `localhost:3000/auth/callback` |
| **AUTHORIZATION_URL** | `https://id.twitch.tv/oauth2/authorize` |
| **TOKEN_URL** | `https://id.twitch.tv/oauth2/token` |
| **SESSION_SECRET** | set by you for use with PassportJS |

Save these values in a .env file

To begin, click the Login to Twitch button on the top right.  If you are already logged in at Twitch.tv it will redirect you to the streamer page.  If not, you will be directed to Twitch.tv to log in, and then returned to the streamer page.

If you would like to log in to another account, you will have to visit Twitch.tv and log out from your account there, then either log in to your other account, or come back here and log in.

This website uses cookies to store non-sensitive information like your twitch username and user_id, but is not stored on a database or sent to anyone other than Twitch to access their API.

This was built using expressJS and the twitch API. (https://github.com/AaronMikelKey/twitch-streams)[You can find the repo here.]