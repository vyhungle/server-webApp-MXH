const { model, Schema } = require("mongoose");

const User = {
  id:Schema.Types.ObjectId,
  username: String,
  password: String,
  email: String,
  createdAt: String,
  displayname: String,
  following: [
    {
      username: String,
      createdAt: String,
      displayname: String,
      avatar: String,
      story: String,
    },
  ],
  follower: [
    {
      username: String,
      createdAt: String,
      displayname: String,
      avatar: String,
      story: String,
    },
  ],
  profile: {
    avatar: String,
    dateOfBirth: String,
    fullName: String,
    story: String,
    coverImage: String,
  },
};

const JoinSchema = new Schema({
  groupId: String,
  name: String,
  imageCover: String,
  member: User,
});

module.exports = model("join", JoinSchema);
