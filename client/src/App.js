import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import SpotifyWebApi from 'spotify-web-api-js';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ArtistTile from './components/artistTile';
import TrackTile from './components/trackTile';
import Auxx from './components/hoc/auxx';
import './styles/custom.scss';
import ReactSpeedometer from "react-d3-speedometer"


function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  //Artists
  const [topArtists, setTopArtists] = useState([]);
  const [topArtistsShort, setTopArtistsShort] = useState([]);
  const [topArtistsMedium, setTopArtistsMedium] = useState([]);
  const [topArtistsLong, setTopArtistsLong] = useState([]);
  //Tracks
  const [topTracks, setTopTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState(false);
  const [topTracksShort, setTopTracksShort] = useState([]);
  const [topTracksMedium, setTopTracksMedium] = useState([]);
  const [topTracksLong, setTopTracksLong] = useState([]);
  //User
  const [currentUser, setCurrentUser] = useState({});

  const [selectedArtists, setSelectedArtists] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState("short_term");

  //Hipster
  const [selectedHipsterOMeter, setSelectedHipsterOMeter] = useState(false);
  const [hipsterScore, setHipsterScore] = useState(0);
  const [bestOf, setBestOf] = useState({});
  const [bestOfSet, setBestOfSet] = useState(false);
  
  const [textFilter, setTextFilter] = useState("Now viewing top short term (past ~4 weeks) artists.");


  //Make API calls all up front on page load
  useEffect(() => {
    const getHashParams = () => {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      e = r.exec(q)
      while (e) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
         e = r.exec(q);
      }
      return hashParams;
    }
  
    const params = getHashParams();
    const token = params.access_token;
    if(token && !isLoggedIn) setIsLoggedIn(true);
    const spotifyApi = new SpotifyWebApi();
    if (token) {
      spotifyApi.setAccessToken(token);
    }  
    Promise.all([      
      spotifyApi.getMyTopArtists({time_range:"short_term", limit:50}),
      spotifyApi.getMyTopArtists({time_range:"medium_term", limit:50}),
      spotifyApi.getMyTopArtists({time_range:"long_term", limit:50}),
      spotifyApi.getMyTopTracks({time_range:"short_term", limit:50}),
      spotifyApi.getMyTopTracks({time_range:"medium_term", limit:50}),
      spotifyApi.getMyTopTracks({time_range:"long_term", limit:50}),
      spotifyApi.getMe()

    ]).then(result => {
      let hScore=0;
      let totalItems=0;
      let topPopArtist = {popularity:0};
      let leastPopArtist = {popularity:100};
      let topPopTrack = {popularity:0};
      let leastPopTrack = {popularity:100};
      sortTopArtists(result[0],"short_term");
      sortTopArtists(result[1],"medium_term");
      sortTopArtists(result[2],"long_term");
      sortTopTracks(result[3],"short_term");
      sortTopTracks(result[4],"medium_term");
      sortTopTracks(result[5],"long_term");

      result[0].items.map(i=>{
        if(i.popularity>topPopArtist.popularity) {
          let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
          topPopArtist.name = i.name;
          topPopArtist.popularity = i.popularity;
          topPopArtist.imgUrl = imgUrl;
        }
        if(i.popularity<leastPopArtist.popularity) {
          let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
          leastPopArtist.name = i.name;
          leastPopArtist.popularity = i.popularity;
          leastPopArtist.imgUrl = imgUrl;
        }
        hScore += 100 - i.popularity;
        totalItems++;
      })
      result[1].items.map(i=>{
        let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
        if(i.popularity>topPopArtist.popularity) {
          topPopArtist.name = i.name;
          topPopArtist.popularity = i.popularity;
          topPopArtist.imgUrl = imgUrl;
        }
        if(i.popularity<leastPopArtist.popularity) {
          let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
          leastPopArtist.name = i.name;
          leastPopArtist.popularity = i.popularity;
          leastPopArtist.imgUrl = imgUrl;
        }
        hScore += 100 - i.popularity;
        totalItems++;
      })
      result[2].items.map(i=>{
        let imgUrl = i.images ? (i.images[2] ? i.images[2].url : "") : "";
        if(i.popularity>topPopArtist.popularity) {
          topPopArtist.name = i.name;
          topPopArtist.popularity = i.popularity;
          topPopArtist.imgUrl = imgUrl;
        }
        if(i.popularity<leastPopArtist.popularity) {
          leastPopArtist.name = i.name;
          leastPopArtist.popularity = i.popularity;
          leastPopArtist.imgUrl = imgUrl;
        }
        hScore += 100 - i.popularity;
        totalItems++;
      })
      result[3].items.map(i=>{
        let imgUrl = i.album.images ? (i.album.images[1] ? i.album.images[1].url : "") : "";
        if(i.popularity>topPopTrack.popularity) {
          topPopTrack.name = i.name;
          topPopTrack.popularity = i.popularity;
          topPopTrack.imgUrl = imgUrl;
        }
        if(i.popularity<leastPopTrack.popularity) {
          leastPopTrack.name = i.name;
          leastPopTrack.popularity = i.popularity;
          leastPopTrack.imgUrl = imgUrl;
        }
        hScore += 100 - i.popularity;
        totalItems++;
      })
      result[4].items.map(i=>{
        let imgUrl = i.album.images ? (i.album.images[1] ? i.album.images[1].url : "") : "";
        if(i.popularity>topPopTrack.popularity) {
          topPopTrack.name = i.name;
          topPopTrack.popularity = i.popularity;
          topPopTrack.imgUrl = imgUrl;
        }
        if(i.popularity<leastPopTrack.popularity) {
          leastPopTrack.name = i.name;
          leastPopTrack.popularity = i.popularity;
          leastPopTrack.imgUrl = imgUrl;
        }
        hScore += 100 - i.popularity;
        totalItems++;
      })
      result[5].items.map(i=>{
        if(i.popularity>topPopTrack.popularity) {
          let imgUrl = i.album.images ? (i.images[1] ? i.album.images[1].url : "") : "";
          topPopTrack.name = i.name;
          topPopTrack.popularity = i.popularity;
          topPopTrack.imgUrl = imgUrl;
        }
        if(i.popularity<leastPopTrack.popularity) {
          let imgUrl = i.album.images ? (i.album.images[1] ? i.album.images[1].url : "") : "";
          leastPopTrack.name = i.name;
          leastPopTrack.popularity = i.popularity;
          leastPopTrack.imgUrl = imgUrl;
        }
        hScore += 100 - i.popularity;
        totalItems++;
      })
      console.log("top track",topPopTrack)
      console.log("least track", leastPopTrack)
      console.log("top artist",topPopArtist)
      console.log("least artist",leastPopArtist)
      
      setHipsterScore((hScore/totalItems).toFixed(2));
      setBestOf({
        "topArtist":topPopArtist,
        "leastArtist":leastPopArtist,
        "topTrack":topPopTrack,
        "leastTrack":leastPopTrack
      })
      sortUser(result[6]);
      setBestOfSet(true);
    })
  },[])

  useEffect(() =>{
    if(Object.keys(currentUser).length>0){
      //Calculate
      let allTracks = [{term:"short_term",tracks:topTracksShort},{term:"medium_term",tracks:topTracksMedium},{term:"long_term",tracks:topTracksLong},{term:"short_term",artists:topArtistsShort},{term:"medium_term",artists:topArtistsMedium},{term:"long_term",artists:topArtistsLong}];
      let instance = axios.create({
        baseURL: process.env.REACT_APP_API_PROD || process.env.REACT_APP_API,
        timeout: 10000,
        headers: {'X-Custom-Header': 'foobar'}
      });
      instance.post('/postTracks', { data: {
        tracks: allTracks,
        user: currentUser
      }})
      .then((err, response) => {      })
      .catch(err => console.log(err))
    }
  },[currentUser])

  //This Effect Handles button filter clicks
  useEffect(() => {
    if(selectedArtists) {
      if(selectedDuration==="short_term") setTopArtists(topArtistsShort);
      if(selectedDuration==="medium_term") setTopArtists(topArtistsMedium);
      if(selectedDuration==="long_term") setTopArtists(topArtistsLong);
    }
    if(selectedTracks) {
      if(selectedDuration==="short_term") setTopTracks(topTracksShort);
      if(selectedDuration==="medium_term") setTopTracks(topTracksMedium);
      if(selectedDuration==="long_term") setTopTracks(topTracksLong);
    }
  },[selectedDuration]);

  //let ip = "http://10.0.0.131"; //Carrah
  let ip = "http://192.168.1.188";
  //let serverip = "http://192.168.1.188:3001"
  
  let isProd = process.env.isPROD ? true : false;
  if(isProd) {
    //clientip = "https://spotify-rankings.herokuapp.com";
    //serverip = "https://spotify-rankings.herokuapp.com";
  }
  

  const sortUser = (data) => {
    let user = {};
    user.country = data.country;
    user.display_name = data.display_name;
    user.email = data.email;
    user.href = data.href;
    user.id = data.id;
    user.imageUrl = data.images[0] ? data.images[0].url : "";
    user.product = data.product;
    setCurrentUser(user);
  }
  

  const sortTopArtists = (data, term) => {
    let artists;
    artists = data.items.map(item => {
      return {
        "id":item.id,
        "name":item.name, 
        "popularity":item.popularity,
        "followers":item.followers.total,
        "imgUrl":item.images[2] ? item.images[2].url : ""
      }
    })
    if(term === "short_term") setTopArtistsShort(artists);
    setTopArtists(artists);
    if(term === "medium_term") setTopArtistsMedium(artists);
    if(term === "long_term") setTopArtistsLong(artists);
  }

  const sortTopTracks = (data,term) => {
    let artist;
    let tracks = data.items.map(item => {
      artist = item.artists.map(a =>{
        return a.name;
      }).join(", ");
      return {
        "id":item.id,
        "name":item.name,
        "artist": artist, 
        "album":item.album.name,
        "popularity":item.popularity,
        "albumImgUrl":item.album.images[2] ? item.album.images[2].url : ""
      }
    })
    if(term === "short_term") setTopTracksShort(tracks);
    if(term === "medium_term") setTopTracksMedium(tracks);
    if(term === "long_term") setTopTracksLong(tracks);
  }
  const handleAbout = () => {
    setShowAbout(true);
  }


  const handleLogin = () => {
    if(isProd) window.location.href = "https://spotify-rankings.herokuapp.com"+'/login';
    if(!isProd) window.location.href = ip+':3001/login';
    
  }
  
  const handleLogout = () => {
    if(isProd) window.location.href = "https://spotify-rankings.herokuapp.com"+'/logout';
    if(!isProd) window.location.href = ip+':3001/logout';
  }

  let loginLink = (
    <div>
      <Button className="btn-sm" onClick={handleLogin}> Login to Spotify </Button>
    </div>
  )

  let logOutLink = (
    <div className="logoutright fontColor">
      
    </div>
  )
  

  const buildArtistList = (artists) => {
    let rows = artists.map((artist,idx) => {
      return (
        <ArtistTile artist={artist} idx={idx} click={handleClick} />

      )
    })
    return(
      <div className="center">
        <div className="master center">
        <div className={"hrow"}>
            <div className="hcol0"><b>Rank</b></div>
            <div className={"col1 center"}></div>
            <div className="hcol2"><b>Artist</b></div>
            <div className="meterCol">Popularity</div>
        </div>

        </div>
        {rows}
      </div>
    )
  }

  const buildTrackList = (tracks) => {
    let rows = tracks.map((track,idx) => {
      return (
        <TrackTile track={track} idx={idx} click={handleClick} />
      )
    })
    return(
      <div className="center">
        <div className="master center">
        <div className={"fontColor hrow"}>
            <div className="hcol0">Rank</div>
            <div className={"col1 center"}></div>
            <div className="hcol2">Track</div>
            <div className="meterCol">Popularity</div>
        </div>

        </div>
        {rows}
      </div>
    )
  }

  const handleClick = (event) => {
    console.log(event)
  }
  
    let handleDurationClick = (event) => {
      setSelectedDuration(event.target.value);
      if(selectedArtists){
        if(event.target.value==="short_term") setTextFilter("Now viewing top short term (past ~4 weeks) artists.");
        if(event.target.value==="medium_term") setTextFilter("Now viewing top medium term (past ~6 months) artists.");
        if(event.target.value==="long_term") setTextFilter("Now viewing top long term (several years) artists.");
        
      }
      else{
        if(event.target.value==="short_term") setTextFilter("Now viewing top short term (past ~4 weeks) songs.");
        if(event.target.value==="medium_term") setTextFilter("Now viewing top medium term (past ~6 months) songs.");
        if(event.target.value==="long_term") setTextFilter("Now viewing top long term (several years) songs.");
      }
    }

  let handleTypeClick = (event) => {
    if(event.target.value==="artists"){
      setSelectedArtists(true);
      setSelectedTracks(false);
      setSelectedHipsterOMeter(false);
      if(selectedDuration==="short_term") {setTopArtists(topArtistsShort); setTextFilter("Now viewing top short term (past ~4 weeks) artists.")};
      if(selectedDuration==="medium_term") {setTopArtists(topArtistsMedium); setTextFilter("Now viewing top medium term (past ~6 months) artists.")};
      if(selectedDuration==="long_term") {setTopArtists(topArtistsLong); setTextFilter("Now viewing top long term (several years) artists.")};
      
    }
    if(event.target.value==="tracks"){
      setSelectedArtists(false);
      setSelectedTracks(true);
      setSelectedHipsterOMeter(false);
      if(selectedDuration==="short_term") {setTopTracks(topTracksShort); setTextFilter("Now viewing top short term (past ~4 weeks) songs.")};
      if(selectedDuration==="medium_term") {setTopTracks(topTracksMedium); setTextFilter("Now viewing top medium term (past ~6 months) songs.")};
      if(selectedDuration==="long_term") {setTopTracks(topTracksLong); setTextFilter("Now viewing top long term (several years) songs.")};
    }
    if(event.target.value==="hipsterometer"){
      setSelectedArtists(false);
      setSelectedTracks(false);
      setSelectedHipsterOMeter(true);
      setTextFilter("");
    }

  }

  let durationButtons = (<div>
    <ButtonGroup className="someSpace btn-xsm" aria-label="Term">
              <Button size="sm" value="short_term" onClick={handleDurationClick} size="sm" variant={ selectedDuration==="short_term" ? "primary" : "secondary" }>Past 4 weeks</Button>
              <Button size="sm" value="medium_term" onClick={handleDurationClick} size="sm" variant={ selectedDuration==="medium_term" ? "primary" : "secondary" }>Past 6 months</Button>
              <Button size="sm" value="long_term" onClick={handleDurationClick} size="sm" variant={ selectedDuration==="long_term" ? "primary" : "secondary" }>All-time</Button>
            </ButtonGroup>
      </div>);
  
  let bestOfDiv = (
    <div className="bestOf">
      <div className="bestOfb">
        <img className="bestOfBorder" height="100px" width="100px" src={bestOfSet ? bestOf.topArtist.imgUrl : ""} /> 
        <p>Most popular artist in your lists: <b>{bestOfSet ? bestOf.topArtist.name : ""}</b></p>
      </div>
      <div className="bestOfb">
        <img className="bestOfBorder" height="100px" width="100px" src={bestOfSet ? bestOf.leastArtist.imgUrl : ""} />
        <p>Least popular artist in your lists: <b>{bestOfSet ? bestOf.leastArtist.name : ""}</b></p>
      </div>
      <div className="bestOfb">
        <img className="bestOfBorder" height="100px" width="100px" src={bestOfSet ? bestOf.topTrack.imgUrl : ""} />
        <p>Most popular song in your lists: <b>{bestOfSet ? bestOf.topTrack.name : ""}</b></p>
      </div>
      <div className="bestOfb">
        <img className="bestOfBorder" height="100px" width="100px" src={bestOfSet ? bestOf.leastTrack.imgUrl : ""} />
        <p>Least popular song in your lists: <b>{bestOfSet ? bestOf.leastTrack.name : ""}</b></p>
      </div>
    </div>
  )

  let hipsterOMeter = (<div className="center">
    <ReactSpeedometer 
      value={hipsterScore}
      minValue={0}
      maxValue={100}
      needleTransitionDuration={3000}
      startColor="#104423"
      endColor="#3aff82"
      needleColor="#ffffff"
      valueTextFontSize="0"
      needleTranition="easeBounceIn"
      />
      <div className="fontColor paragraph">
      <p className="center whacky">Your Hipster Score is <span className="xlarge"><b>{hipsterScore}</b></span></p><br />

      
        Your Hipster score is calculated using a patented, highly confidential, and top secret algorithm based on Spotify's "popularity" metric for 
        each of the artists and tracks in your rankings. <br /><br />
        {bestOfDiv}
      </div>
      </div>)

  let title = (<div>
    <h2 className="siteHeader titleFont">My Spotify Rankings</h2>

  </div>)

  let nav = (<div className="navbar">
    <Button className="fontColor btn-outline-light" size="sm" variant="black" onClick={handleAbout}> About this site</Button>
    <Button className="fontColor btn-outline-light" size="sm" variant="black" onClick={handleLogout}> Switch User </Button>
  </div>)

  let about = <div className="fontColor center">
  {title}
  <p className="paragraph">This site presents data collected from Spotify to populate your rankings lists and Hipster score. This app is registered with Spotify 
    and does not have access to your account. It can only access a small amount of data about your top artists and tracks 
    when you login and approve.</p>
  <Button size="sm" onClick={()=>{setShowAbout(false)}}>Back</Button>
</div>

    


  let body = (<>
      <div className="center fontColor  ">
        {title}
        <div className="toggleControls center">
          
          <ButtonGroup className="someSpace" aria-label="Basic example">
            <Button value="artists" onClick={handleTypeClick} className="sideSpace" size="md" variant={ selectedArtists ? "primary" : "secondary" }>Top Artists</Button>
            <Button value="tracks" onClick={handleTypeClick} className="sideSpace" size="md" variant={ selectedTracks ? "primary" : "secondary" }>Top Songs</Button>
            <Button value="hipsterometer" onClick={handleTypeClick} className="btn-outline-danger sideSpace whacky" size="md" variant={ selectedHipsterOMeter ? "black" : "secondary" }>Hipster-o-Meter</Button>
          </ButtonGroup>
          {!selectedHipsterOMeter ? durationButtons : ""}
          </div>
          <span className="textFilter">{/*textFilter*/}</span>
          </div>
      <br />
      <br />
      {selectedHipsterOMeter ? hipsterOMeter : ""}
      {selectedArtists ? buildArtistList(topArtists) : ""}
      {selectedTracks ? buildTrackList(topTracks) : ""}
      {topArtists.length>0 ? nav : ""}
    
    </>
  )

  let homepage = <div className="fontColor center">
    <h1>Spotify Stats</h1>
    <p>Login to see a listing of your top played artists and songs.... oh and also to see your hipster score.</p>
    {loginLink}
  </div>

  return (
    <div className='App'>
      {isLoggedIn ? logOutLink : ""}
      {isLoggedIn && !showAbout ? body : ""}
      {isLoggedIn && showAbout ? about : ""}
      {!isLoggedIn && !showAbout ? homepage : ""}
    </div>
  );
}

export default App;
