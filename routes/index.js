require('dotenv').config()
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch')


// If user has an authenticated session, display it, otherwise display link to authenticate
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Twitch Subs', user: JSON.stringify(req.session), link:'/auth/twitch', cssLink:'../css/style.css' })   
});

router.get('/user', async function (req, res, next) {
  let dataRes = await fetch('https://api.twitch.tv/helix/users', {
      method: 'GET',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Authorization': 'Bearer ' + req.session.passport.user.accessToken
      }
    }).then(res => res.json())
      .then(jsonResponse => jsonResponse.data[0])
  
  dataRes = JSON.stringify(dataRes, ['id','display_name'])
  res.cookie('userData', dataRes, {expires: new Date(Date.now() + 120000)}).redirect('/user-2')
})

router.get('/user-2', async function(req,res,next) {
  let userData = JSON.parse(req.cookies.userData)
  let username = userData.display_name
  let userID = userData.id
  let followArr = []

  const fillArray = (total, data) => {
    let newArr = []
    for (let i=0;i<total;i++) {
      newArr.push('user_id='+data[i].to_id+'&')
    }
    newArr = newArr.toString()
    followArr = newArr.replace(/\,/g, '')
    return true
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
    .then(() => console.log(followArr))
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
      )

  streamList()
    .then(data => res.render('user', { title: 'Twitch Subs Userpage', username: username, user: data }))
})

module.exports = router;