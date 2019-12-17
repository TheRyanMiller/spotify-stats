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
//var ip="http://10.0.0.131"; //Carrah's house
let ip="http://192.168.1.188"; //Ryan's house
let baseUrl = process.env.REACT_APP_ISPROD === "true"  ? "http://music-rankings.com" : ip+":3000";
let redirect_uri = process.env.REACT_APP_ISPROD === "true"  ? baseUrl+"/callback" : ip+":3001/callback"


// connects our back end code with the database;

let dbString = process.env.MONGO_PROD_URL|| process.env.MONGO_URL_DEV;
mongoose.connect(dbString, { useNewUrlParser: true });
let db = mongoose.connection;
db.once('open', () => console.log('connected to the database... '+ dbString));
// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
let client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret

if(!(process.env.REACT_APP_ISPROD || process.env.REACT_APP_ISPROD === "true")) dest = ip+":3000/#";

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

  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
  console.log("IN LOGIN. baseurl = ", req.baseUrl)
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
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
  let scope = 'user-read-private user-read-email user-top-read';
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

  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
        console.log("INSIDE CALLBACK code: ", req.query.code)
        console.log("INSIDE CALLBACK query: ", req.query)
        console.log("INSIDE CALLBACK state: ", req.state)
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxx")
  
  if (state === null || state !== storedState) {
    res.redirect(baseUrl+"/#" + 
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } 
  else {
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
        console.log("=============================")
        console.log("Entering redirect to main page wiht this AT: ", access_token)
        console.log("=============================")
        // Here I pass the token to the URLwe can also pass the token to the browser to make requests from there
        res.redirect(baseUrl+"/#" +  
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect(baseUrl+"/#" + 
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
  const { user, tracks, hipsterScore } = req.body.data;
  let trackList = new TrackList({
    list: tracks, 
    user: user,
    hipsterScore: hipsterScore
  });
  let visitLog = new VisitLog(user);
  visitLog.save(()=>{
    console.log("Visitor log written");
  });
  
  let uid = user.id;
  let query = {
    "user.id" : uid, 
    createdAt: {$gte: new Date((new Date().getTime() - (14 * 24 * 60 * 60 * 1000)))}
  };

  TrackList.countDocuments(
    query,(err, count)=>{
      console.log("Count = ",count)
      if(count===0){
        trackList.markModified('list');
        trackList.markModified('list.tracks'); 
        trackList.save((err) => {
          if (err) return res.json({ success: false, error: err });
          console.log("Tracklog written.");
          return res.json({ success: true });
        });
      }
      else{console.log("Tracklog write bypassed.");}
  })
  
});

// launch our backend into a port
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
app.listen(process.env.PORT || process.env.API_PORT, () => console.log(`LISTENING ON PORT ${process.env.PORT || process.env.API_PORT}`));

