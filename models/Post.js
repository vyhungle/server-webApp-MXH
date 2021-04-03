const { model, Schema } = require('mongoose');

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  image: String,
  verified: Boolean,
  displayname:String,
  avatar:String,
  comments: [
    {
      body: String,
      username: String,
      createdAt: String,
      displayname:String,
      avatar:String
    }
  ],
  likes: [
    {
      username: String,
      createdAt: String
    }
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }
});

module.exports = model('Post', postSchema);
