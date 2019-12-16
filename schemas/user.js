const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const UserSchema = new Schema(
  {
    id: String,
    country: String,
    isAdmin: Boolean,
    email: String,
    display_name: String,
    imageUrl: String,
    href: String,
    product: String,
    lastLoggedIn: Date,
    rsvpdEventIds: [String]    
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = UserSchema;
