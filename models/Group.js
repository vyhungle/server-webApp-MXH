const { model, Schema } = require("mongoose");
// const User=require('./index')
// const Post=require('./index')
// const TypeGroup=require('./index')

// import {User,Post,TypeGroup  } from "./index";

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

const TypeGroup = {
  name: String,
  slug: String,
};

const Post = {
  body: String,
  username: String,
  createdAt: String,
  image: [String],
  verified: Boolean,
  displayname: String,
  avatar: String,
  comments: [
    {
      body: String,
      username: String,
      createdAt: String,
      displayname: String,
      avatar: String,
    },
  ],
  likes: [
    {
      username: String,
      createdAt: String,
      displayname: String,
      avatar: String,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
};

const Join = {
  groupId: String,
  name: String,
  imageCover: String,
  member: User,
};

const groupSchema = new Schema({
  leader: User,
  admins: [User],
  members: [User],
  typeGroup: TypeGroup,
  name: String,
  imageCover: String,
  countMembers: String,
  public: Boolean,
  describe: String,
  posts: [Post],
  createdAt: String,
  joins:[Join]
});

module.exports = model("group", groupSchema);
