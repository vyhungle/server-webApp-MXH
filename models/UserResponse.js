const { model, Schema } = require('mongoose');

const userResponseSchema = new Schema({
    error: [{
        field: String,
        message: String,
    }],
    user:{
        id:String,
        token:String,
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
            coverImage:String,
    },
    }
  
  
});

module.exports = model('UserResponse', userResponseSchema);
