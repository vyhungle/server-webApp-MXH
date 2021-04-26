const { model, Schema } = require("mongoose");

const productSchema = new Schema({
  price:String,
  body:String,
  address:String,
  createdAt:String,    
  image:[String],
  category:{
    name:String,
    slug:String,
  },
  describe:String, 
  seller:{
    username: String,
    password: String,
    email: String,
    createdAt: String,
    displayname: String,
    following: [{
      username: String,
      createdAt: String,
      displayname:String,
      avatar:String,
      story:String,
    }],
    follower: [{
      username: String,
      createdAt: String,
      displayname:String,
      avatar:String,
      story:String,
    }],
    profile:{
      avatar: String,
      dateOfBirth: String,
      fullName: String,
      story: String,
      coverImage:String,
    },
  }
});

module.exports = model("product", productSchema);
