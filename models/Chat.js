const { model, Schema } = require("mongoose");

const chatSchema = new Schema({
  name:String,
  image:String,
  members: [
    {
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
      stay:Boolean,
    },
  ],
  content: [
    {
      displayname: String,
      username: String,
      createdAt: String,
      content: String,
      image:String,
      avatar:String,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = model("Chat", chatSchema);
