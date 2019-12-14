import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import SpotifyWebApi from 'spotify-web-api-js';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';


function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nowPlaying, setNowPlaying] = useState({ name: 'Not checked yet.', albumArt: ''});
  const [spotifyCallCount, setSpotifyCallCount] = useState(0);
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

  useEffect(() => {
    getTopTracks("short_term");
    getTopTracks("medium_term");
    getTopTracks("long_term");
    getTopArtists("short_term");
    getTopArtists("medium_term");
    getTopArtists("long_term");
    getUserInfo();
  },[]);

  useEffect(()=>{
    console.log("spotify CALL COUNT:  "+spotifyCallCount)
    if(spotifyCallCount>5){
        let allTracks = [{term:"short_term",tracks:topTracksShort},{term:"medium_term",tracks:topTracksMedium},{term:"long_term",tracks:topTracksLong}];
        //Run Hipster-ometer logic
        console.log("ALL HERE BABY!!!!!!xxxxxxxx");
        instance.post('/postTracks', null, { data: {
          tracks: allTracks,
          user: currentUser
        }})
        .then((response) => {
          
        })
    }
  },[spotifyCallCount])

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

  

  //const ip = "http://10.0.0.131";
  const ip = "http://192.168.1.188"

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

  let instance = axios.create({
    baseURL: process.env.REACT_APP_PROD_API || process.env.REACT_APP_API,
    timeout: 10000,
    headers: {'X-Custom-Header': 'foobar'}
  });
  

  const spotifyApi = new SpotifyWebApi();
  const token = params.access_token;
  if (token) {
    spotifyApi.setAccessToken(token);
  }

  if(token && !isLoggedIn) setIsLoggedIn(true);

  const getUserInfo = () => {
    let user = {};
    spotifyApi.getMe()
      .then((response)=>{
        user.country = response.country;
        user.display_name = response.display_name;
        user.email = response.email;
        user.href = response.href;
        user.id = response.id;
        user.imageUrl = response.images[0] ? response.images[0].url : "";
        user.product = response.product;
        setCurrentUser(user);
        setSpotifyCallCount(spotifyCallCount+1);
      })
  }
  

  const getTopArtists = (term) => {
    let artists;
    spotifyApi.getMyTopArtists({time_range:term, limit:50})
      .then((response) => {
        artists = response.items.map(item => {
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
        setSpotifyCallCount(spotifyCallCount+1);
      })
      .catch(err => console.log("ERROR"))
    
  }

  const getTopTracks = (term) => {
    let tracks;
    spotifyApi.getMyTopTracks({time_range:term, limit:50})
      .then((response) => {
        let artist;
        let tracks = response.items.map(item => {
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
        console.log("---------");
        console.log("",tracks,term);
        setSpotifyCallCount(spotifyCallCount+1);
      })
  }

  const meterStyle = {"background-size": "90% 100%"};
  let loginLink = (
    <div>
      <a href={ip+':3001/login'}> Login to Spotify </a>
    </div>
  )

  const allTracksReturned = () => {
    if(topTracksShort.length > 0 && topTracksMedium > 0 && topTracksLong > 0){
      return true;
    }
    return false;
  }

  const allArtistsReturned = () => {
    if(topArtistsShort.length > 0 && topArtistsMedium > 0 && topArtistsLong > 0){
      return true;
    }
    return false;
  }

  const buildArtistList = (artists) => {
    let rows = artists.map((artist,idx) => {
      return (
          <tr key={artist.id}>
            <td className="rankColumn">{idx+1+"."}</td>
            <td className="imgColumn"><img width="40px" height="40px" src={artist.imgUrl} /></td>
            <td>{artist.name}</td>
            <td className="meter" width="10%" style={{"backgroundSize": artist.popularity+"% 100%"}}>{artist.popularity+"/100"}</td>
          </tr>
      )
    })
    return(
      <div>
        <table>
          <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Artist</th>
            <th>Popularity</th>
          </tr>
          </thead>
            <tbody>
            {rows}
            </tbody>
        </table>
      </div>
    )
  }

  const buildTrackList = (tracks) => {
    let rows = tracks.map((track,idx) => {
      return (
        <tr className="someSpace" key={track.id} style={{fontSize: "14px"}}>
          <td className="rankColumn">{idx+1+"."}</td>
          <td className="imgColumn"><img width="40px" height="40px" src={track.albumImgUrl} /></td>
          <td title={track.name}>{track.name.length>25 ? track.name.substring(0,25)+"..." : track.name}</td>
          <td className="nomarginnopad" title={track.artist}>
            {track.artist.length>25 ? track.artist.substring(0,25)+"..." : track.artist} 
            <span className="nomarginnopad" style={{fontSize: "10px"}}> (<i>{track.album.length>20 ? track.album.substring(0,20)+"..." : track.album}</i>)</span></td>
          <td className="meter" width="10%" style={{"backgroundSize": track.popularity+"% 100%"}}>{track.popularity+"/100"}</td>
        </tr>
      )
    })
    return(
      <div>
        <table>
          <thead>
          <tr style={{fontSize: "14px"}}>
            <th></th>
            <th></th>
            <th>Track</th>
            <th>Artist (Album)</th>
            <th>Popularity</th>
          </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    )
  }

  let handleTopArtistsChange = (event) => {
    getTopArtists(event.target.value);
  }
  let handleTopTracksChange = (event) => {
    getTopTracks(event.target.value);
  }

  
    let handleDurationClick = (event) => {
      setSelectedDuration(event.target.value);
    }

    let handleTypeClick = (event) => {
      if(event.target.value==="artists"){
        setSelectedArtists(true);
        setSelectedTracks(false);
        if(selectedDuration==="short_term") setTopArtists(topArtistsShort);
        if(selectedDuration==="medium_term") setTopArtists(topArtistsMedium);
        if(selectedDuration==="long_term") setTopArtists(topArtistsLong);
      }
      else{
        setSelectedArtists(false);
        setSelectedTracks(true);
        if(selectedDuration==="short_term") setTopTracks(topTracksShort);
        if(selectedDuration==="medium_term") setTopTracks(topTracksMedium);
        if(selectedDuration==="long_term") setTopTracks(topTracksLong);
      }
      
    }


  return (
    <div className='App'>
      {isLoggedIn ? "" : loginLink}
      <br />
      <div className="toggleControls">
        <ButtonGroup className="someSpace" aria-label="Basic example">
          <Button value="artists" onClick={handleTypeClick} variant={ selectedArtists ? "primary" : "secondary" }>Artists</Button>
          <Button value="tracks" onClick={handleTypeClick} variant={ selectedTracks ? "primary" : "secondary" }>Songs</Button>
        </ButtonGroup>
        <br />
        <ButtonGroup className="someSpace" aria-label="Basic example">
          <Button size="sm" value="short_term" onClick={handleDurationClick} variant={ selectedDuration==="short_term" ? "primary" : "secondary" }>Short</Button>
          <Button size="sm" value="medium_term" onClick={handleDurationClick} variant={ selectedDuration==="medium_term" ? "primary" : "secondary" }>Medium</Button>
          <Button size="sm" value="long_term" onClick={handleDurationClick} variant={ selectedDuration==="long_term" ? "primary" : "secondary" }>Long</Button>
        </ButtonGroup>
      </div>

      {selectedArtists ? buildArtistList(topArtists) : ""}
      {selectedTracks ? buildTrackList(topTracks) : ""}

    </div>
  );
}

export default App;
