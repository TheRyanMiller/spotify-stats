/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const mongoose = require('mongoose');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const path = require("path");
const bodyParser = require('body-parser');
const logger = require('morgan');
const TrackList = require('./schemas/trackList');
const TList = require('./schemas/tList');
const Tracks = require('./schemas/track');
const User = require('./schemas/user');
const VisitLog = require('./schemas/visitLog');

require('dotenv').config();

const app = express();
app.use(cors());
const router = express.Router();
let isProd = process.env.isPROD ? true : false;
//var ip="http://10.0.0.131";
var ip="http://192.168.1.188";
// connects our back end code with the database;
console.log("Mongo DEV URL: ",process.env.MONGO_URL_DEV)

let dbString = process.env.MONGO_PROD_URL|| process.env.MONGO_URL_DEV;
mongoose.connect(dbString, { useNewUrlParser: true });
let db = mongoose.connection;
db.once('open', () => console.log('connected to the database... '+ dbString));
// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
let client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
let redirect_uri = "";

if(isProd) redirct_uri = "https://spotify-rankings.herokuapp.com/callback";
else{redirect_uri = ip+':3001/callback';}

// USE middleware are executed every time a request is receieved
// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
let generateRandomString = function(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let stateKey = 'spotify_auth_state';

app.use(express.static(path.join(__dirname, "client", "build")))
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  let state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  let scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/logout', function(req, res) {

  let state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  let scope = 'user-read-private user-read-email user-read-playback-state user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog:true
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(ip+':3000/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // print to console of Server ... use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // Here I pass the token to the URLwe can also pass the token to the browser to make requests from there
        res.redirect(ip+':3000/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect(ip+':3000/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.use('/', router);


router.post('/api/postTracks', (req, res) => {
  console.log("TRYING------------xxxxxxxxx--------");
  //return res.json({ success: true });
  const { user, tracks } = req.body.data;
  //newTracks = [new Tracks(tracks[0]),new Tracks(tracks[1]),new Tracks(tracks[2])];
  let trackList = new TrackList({
    list: tracks, 
    user: user
  });
  let visitLog = new VisitLog(user);
  visitLog.save(()=>{
    console.log("Log Saved");
  });
  
  let uid = user.id;
  let query = {
    "user.id" : uid, 
    createdAt: {$gte: new Date((new Date().getTime() - (14 * 24 * 60 * 60 * 1000)))}
  };
  console.log("=======FIND DATA=====");

  let writeEnabled = true;
  TrackList.find(
    query,(err, data)=>{
      data.map(obj => {
        //console.log(obj.user.display_name);
      })
      if(data.length>0){
        writeEnable = false;
        console.log("Write Disabled")
      }
      if(writeEnabled){
        trackList.markModified('list');
        trackList.markModified('list.tracks'); 
        trackList.save((err) => {
          if (err) return res.json({ success: false, error: err });
          return res.json({ success: true });
        });
      }
  })

  //Check db if recent records exist before saving everything
  
});

// launch our backend into a port
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
app.listen(process.env.PORT || process.env.API_PORT, () => console.log(`LISTENING ON PORT ${process.env.PORT || process.env.API_PORT}`));

