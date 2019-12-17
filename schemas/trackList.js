const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

// this will be our data base's data structure 
const TrackLists = new Schema(
  {
    list: [{
      term: String,
      tracks: [
        {
          id:String,
          name:String,
          artist: String,
          album: String,
          popularity: Number,
          albumImgUrl: String
        }
      ],
    }],
    user: User,
    hipsterScore: Number
  },
  
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("tracklist", TrackLists);
