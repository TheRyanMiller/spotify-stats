import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import SpotifyWebApi from 'spotify-web-api-js';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ArtistTile from './components/artistTile';
import TrackTile from './components/trackTile';


function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  //Make API calls all up front on page load
  useEffect(() => {
    Promise.all([      
      spotifyApi.getMyTopArtists({time_range:"short_term", limit:50}),
      spotifyApi.getMyTopArtists({time_range:"medium_term", limit:50}),
      spotifyApi.getMyTopArtists({time_range:"long_term", limit:50}),
      spotifyApi.getMyTopTracks({time_range:"short_term", limit:50}),
      spotifyApi.getMyTopTracks({time_range:"medium_term", limit:50}),
      spotifyApi.getMyTopTracks({time_range:"long_term", limit:50}),
      spotifyApi.getMe()

    ]).then(result => {
      console.log("API Calls are back. Total: ",result.length)
      sortTopArtists(result[0],"short_term");
      sortTopArtists(result[1],"medium_term");
      sortTopArtists(result[2],"long_term");
      sortTopTracks(result[3],"short_term");
      sortTopTracks(result[4],"medium_term");
      sortTopTracks(result[5],"long_term");
      sortUser(result[6]);
    })
  },[])

  useEffect(() =>{
    if(Object.keys(currentUser).length>0){
      console.log("Inserting into DB");
      let allTracks = [{term:"short_term",tracks:topTracksShort},{term:"medium_term",tracks:topTracksMedium},{term:"long_term",tracks:topTracksLong}];
      //Run Hipster-ometer logic
      let instance = axios.create({
        baseURL: process.env.REACT_APP_PROD_API || process.env.REACT_APP_API,
        timeout: 10000,
        headers: {'X-Custom-Header': 'foobar'}
      });
      instance.post('/postTracks', { data: {
        tracks: allTracks,
        user: currentUser
      }})
      .then((err, response) => {
        console.log("Completed Insert into DB",response,err)
      })
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
  const token = params.access_token;
  if(token && !isLoggedIn) setIsLoggedIn(true);
  const spotifyApi = new SpotifyWebApi();
  if (token) {
    spotifyApi.setAccessToken(token);
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
  let loginLink = (
    <div>
      <a href={ip+':3001/login'}> Login to Spotify </a>
    </div>
  )

  // const buildArtistList = (artists) => {
  //   let rows = artists.map((artist,idx) => {
  //     return (
  //         <tr key={artist.id}>
  //           <td className="rankColumn">{idx+1+"."}</td>
  //           <td className="imgColumn"><img width="40px" height="40px" src={artist.imgUrl} /></td>
  //           <td>{artist.name}</td>
  //           <td className="meter" width="10%" style={{"backgroundSize": artist.popularity+"% 100%"}}>{artist.popularity+"/100"}</td>
  //         </tr>
  //     )
  //   })
  //   return(
  //     <div>
  //       <table>
  //         <thead>
  //         <tr>
  //           <th></th>
  //           <th></th>
  //           <th>Artist</th>
  //           <th>Popularity</th>
  //         </tr>
  //         </thead>
  //           <tbody>
  //           {rows}
  //           </tbody>
  //       </table>
  //     </div>
  //   )
  // }

  const buildArtistList = (artists) => {
    let rows = artists.map((artist,idx) => {
      return (
        <ArtistTile artist={artist} idx={idx} click={handleClick} />

      )
    })
    return(
      <div className="center">{rows}</div>
    )
  }

  const buildTrackList = (tracks) => {
    let rows = tracks.map((track,idx) => {
      return (
        <TrackTile track={track} idx={idx} click={handleClick} />

      )
    })
    return(
      <div className="center">{rows}</div>
    )
  }

  const handleClick = (event) => {
    console.log(event)
  }

  // const buildTrackList = (tracks) => {
  //   let rows = tracks.map((track,idx) => {
  //     return (
  //       <tr className="someSpace" key={track.id} style={{fontSize: "14px"}}>
  //         <td className="rankColumn">{idx+1+"."}</td>
  //         <td className="imgColumn"><img width="40px" height="40px" src={track.albumImgUrl} /></td>
  //         <td title={track.name}>{track.name.length>25 ? track.name.substring(0,25)+"..." : track.name}</td>
  //         <td className="nomarginnopad" title={track.artist}>
  //           {track.artist.length>25 ? track.artist.substring(0,25)+"..." : track.artist} 
  //           <span className="nomarginnopad" style={{fontSize: "10px"}}> (<i>{track.album.length>20 ? track.album.substring(0,20)+"..." : track.album}</i>)</span></td>
  //         <td className="meter" width="10%" style={{"backgroundSize": track.popularity+"% 100%"}}>{track.popularity+"/100"}</td>
  //       </tr>
  //     )
  //   })
  //   return(
  //     <div>
  //       <table>
  //         <thead>
  //         <tr style={{fontSize: "14px"}}>
  //           <th></th>
  //           <th></th>
  //           <th>Track</th>
  //           <th>Artist (Album)</th>
  //           <th>Popularity</th>
  //         </tr>
  //         </thead>
  //         <tbody>
  //           {rows}
  //         </tbody>
  //       </table>
  //     </div>
  //   )
  // }

  
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
