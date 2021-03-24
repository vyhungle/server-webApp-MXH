const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
  friends: [{
    username: String,
    createdAt: String,
  }],
  profile:[{
    avatar: String,
    displayname: String,
    dateOfBirth: String,
    fullName: String,
    story: String,
    follower: String,
    following: String,
  }],
  
});

module.exports = model('User', userSchema);
