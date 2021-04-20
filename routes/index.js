require('dotenv').config()
const { json } = require('express');
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch')


// If user has an authenticated session, display it, otherwise display link to authenticate
router.get('/', function (req, res, next) {
  let passport = false
  let loggedIn = false
  //check for session
  if (req.session.passport) {
    passport = true
    //check for login data to show logout button
    if (req.cookies.userData) {
      loggedIn = true
    }
  }
  res.render('index', { title: 'Twitch Subs', user: JSON.stringify(req.session.passport), passport: passport, loggedIn: loggedIn })   
});

// GET user data from twitch, only need id and display_name
// There are no links to this route, it's the callback from logging in with passport
router.get('/login', async function (req, res, next) {
  let dataRes = await fetch('https://api.twitch.tv/helix/users', {
      method: 'GET',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Authorization': 'Bearer ' + req.session.passport.user.accessToken
      }
    }).then(res => res.json())
      .then(jsonResponse => jsonResponse.data[0])
  // Cut response down to id and display_name, else res contains more info we don't need for this app
  // Also converts JSON response to a string
  dataRes = JSON.stringify(dataRes, ['id','display_name'])
  // Sets cookie with the resulting user_id and display_name
  res.cookie('userData', dataRes, {expires: new Date(Date.now() + 7200000)}).redirect('/user')
})

//GET user page.  Shows twitch follows and their stream info if they are live now.
router.get('/user', async function(req,res,next) {
  //check for session
  let passport = false
  //User is logged in if they see this page so no need to check.
  let loggedIn = true
  if (req.session.passport && req.cookies.userData) {
    passport = true
  let userData = JSON.parse(req.cookies.userData) 
  let username = userData.display_name
  let userID = userData.id
  let followArr = []
  let offline = []

  // function to push follower list to array for the next request and get usernames for all follows
  // GET streams doesn't return info on offline follows so we need to save all the usernames to filter later so we can show offline follows
  const fillArray = (total, data) => {
    let newArr = []
    let newArr2 = []
    for (let i=0;i<total;i++) {
      // Twitch API wants each user ID to be requested this way instead of an array or list for some reason
      newArr.push('user_id='+data[i].to_id+'&')
      newArr2.push(data[i].to_name)
    }
    newArr = newArr.toString()
    followArr = newArr.replace(/\,/g, '')
    offline = newArr2
    return
  }

  // Function to filter streamers from total list
  const showOffline = (totalFollows, streamingNow) => {
    let s = streamingNow.data,
      arr = totalFollows,
      arr2 = []
    for (let k=0;k<s.length;k++) {
        arr2.push(s[k].user_name)
    }
    let res = arr.filter(item => arr2.indexOf(item) == -1)
    console.log('\n res \n'+res+'\n')
    return ([res, streamingNow.data])
  }

  let streamList = () => fetch('https://api.twitch.tv/helix/users/follows?first=100&from_id='+userID, {
    method: 'GET',
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + req.session.passport.user.accessToken
    }
  }).then(res => res.json())
    .then(jsonResponse => fillArray(jsonResponse.total, jsonResponse.data))
    .then(() => 
      fetch('https://api.twitch.tv/helix/streams?user_id='+followArr+'first=100', {
        method: 'GET',
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Authorization': 'Bearer ' + req.session.passport.user.accessToken
        }
      })
        .then(res => res.json())
        .then(jsonResponse => showOffline(offline, jsonResponse))
      )

  streamList()
    .then(data => res.render('user', { title: 'Twitch Subs Userpage', username: username, streaming: data[1], offline: data[0], passport: passport, loggedIn: loggedIn }))
} else {
  res.redirect('/')
}
}) 

module.exports = router;