const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const TList = new Schema(
  {
    tracks: [
        {
          id:String,
          name:String,
          artist: String,
          album: String,
          popularity: Number,
          albumImgUrl: String
        }
      ]
  },
  
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("tlist", TList);
