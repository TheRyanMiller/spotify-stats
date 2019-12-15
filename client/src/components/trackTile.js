import React from 'react';
import './tile.css';
import Aux from './hoc/auxx';

const tile = (props) =>{
  let tile = (<div className="content-row"></div>);

  tile = (
        <div className="master center">

            {/* Bordered Row DIV */}
            <div className={"fontColor row"} onClick={props.click}>
                
                {/* Rank */}
                <div className="col0">
                <span>{props.idx + 1}</span><br />
                </div>

                {/* ArtistImg */}
                <div className={"col1 center"}>
                <img src={props.track.albumImgUrl} width="40px" height="40px" alt="Artist Image" style={{borderRadius: "10px"}}></img>
                </div>

                {/* Track + Artistt */}
                <div className="col2">
                    <span className="titleline"><b>{props.track.name}</b></span><br />
                    <span className="titleline" style={{fontSize: "12px"}}>{props.track.artist}</span>
                </div>
                
                
                {/* Popularity */}
                <div className="meter">
                    <meter min="0" max="100" low="30" high="80" optimum="100" value={props.track.popularity}> </meter>
                    <span className="large" style={{fontSize: "12px"}}> {props.track.popularity}</span>
                </div>

            </div>

        </div>
    )
  return (
    <Aux className="container"> {tile} </Aux>
  )
}

export default tile;
