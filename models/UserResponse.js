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
        friends: [{
            username: String,
            createdAt: String,
        }],
        profile:[{
            avatar: String,
            dateOfBirth: String,
            fullName: String,
            story: String,
            follower: String,
            following: String,
    }],
    }
  
  
});

module.exports = model('UserResponse', userResponseSchema);
