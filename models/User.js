const { model, Schema } = require('mongoose');

const userSchema = new Schema({
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
  }],
  follower: [{
    username: String,
    createdAt: String,
    displayname:String,
    avatar:String,
  }],
  profile:{
    avatar: String,
    dateOfBirth: String,
    fullName: String,
    story: String,
  },
  
});

module.exports = model('User', userSchema);
