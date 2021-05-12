export default User = {
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

export default TypeGroup = {
  name: String,
  slug: String,
};

export default Post = {
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
