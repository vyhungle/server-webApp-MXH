const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  username: {type:String,unique:true},
  password: String,
  email: String,
  createdAt: String,
  displayname: String,
  friends: [{
    username: String,
    createdAt: String,
  }],
  profile:{
    avatar: String,
   
    dateOfBirth: String,
    fullName: String,
    story: String,
    follower: String,
    following: String,
  },
  
});

module.exports = model('User', userSchema);
