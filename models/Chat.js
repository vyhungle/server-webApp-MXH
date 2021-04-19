const { model, Schema } = require('mongoose');

const chatSchema = new Schema({
   
    members:[{
      username: String,
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
    }],
    content: [
        {
            displayname:String,
            username: String,
            createdAt: String,
            content: String
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
});

module.exports = model('Chat', chatSchema);
