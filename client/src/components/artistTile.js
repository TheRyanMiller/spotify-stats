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
                <img src={props.artist.imgUrl} width="40px" height="40px" alt="Artist Image" style={{borderRadius: "10px"}}></img>
                </div>

                {/* Artist */}
                <div className="col2">
                    <span className="titleline">{props.artist.name}</span>
                </div>
                
                
                {/* Popularity */}
                <div className="meterCol">
                    <meter className="popMeter" optimum="1" min="0" max="100" value={props.artist.popularity}> </meter>
                    <span className="large" style={{fontSize: "12px"}}> {props.artist.popularity}</span>
                </div>

            </div>

        </div>
    )
  return (
    <Aux className="container"> {tile} </Aux>
  )
}

export default tile;
