const { AuthenticationError, UserInputError } = require("apollo-server");
const { formatError } = require("graphql");
const cloudinary = require("cloudinary");

const Chat = require("../../models/Chat.js");
const User = require("../../models/User.js");
const checkAuth = require("../../util/check-auth");
const { isUser } = require("../../util/function/chat.js");

module.exports = {
  Query: {
    async getChats() {
      try {
        const chats = await Chat.find();
        return chats;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getChat(_, { roomId }, context) {
      try {
        const chat = await Chat.findById(roomId);
        if (chat) {
          return chat;
        } else throw new Error("Phong nay khong ton tai");
      } catch (err) {
        throw new Error(err);
      }
    },
    async getChatReverse(_, { roomId }, context) {
      try {
        const chat = await Chat.findById(roomId);
        if (chat) {
          chat.content.reverse();
          return chat;
        } else throw new Error("Phong nay khong ton tai");
      } catch (err) {
        throw new Error(err);
      }
    },
    async getRoomChat(_, {}, context) {
      let values = [];

      const user = checkAuth(context);
      var username = user.username;
      try {
        const chat = await Chat.find();
        chat.forEach((element) => {
          element.members.map((m)=>{
           if( m.username===username) values.push(element)
          })
        });
        return values;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createRoomChat(_, { userId }, context) {
      const user = checkAuth(context);
    
      const from = await User.findOne({ username: user.username });
      if (userId.length <= 1) {
        const to = await User.findById(userId[0]);
        const chat = await Chat.find();
        var dk = 1;
        try {
          chat.forEach((element) => {
            if (
              (element.members[0].username === to.username &&
                element.members[1].username === from.username) ||
              (element.members[0].username === from.username &&
                element.members[1].username === to.username)
            ) {
              dk = 0;
            }
          });
          if (dk == 1 && to && from) {
            const members = [];
            members.push(to);
            members.push(from);
            const room = new Chat({
              members,
            });
            room.save();
            return room.id;
          } else {
            const seller = await User.findById(userId[0]);
            const rooms = await Chat.find();
            var rID = "";
            rooms.map((r) => {
              if (
                (r.members[0].username === user.username &&
                  r.members[1].username === seller.username) ||
                (r.members[1].username === user.username &&
                  r.members[0].username === seller.username)
              ) {
                rID = r.id;
              }
            });
            return rID;
          }
        } catch (error) {
          throw new Error(error);
        }
      }
      else{
        const members = [];
        members.push(from);
       
        for(var i=0;i<userId.length;i++){
          const user=await User.findById(userId[i]);
          members.push(user)
        }
        const room = new Chat({
          image:from.profile.avatar,
          name:`Nhóm của ${from.displayname}`,
          members,
        });
        room.save();
        return room.id;
      }
    },
    async createRoomChatUsername(_, { username }, context) {
      const user = checkAuth(context);
      const to = await User.findOne({ username: username });

      const from = await User.findOne({ username: user.username });
      const chat = await Chat.find();
      var dk = 1;
      try {
        chat.forEach((element) => {
          if (
            (element.members[0].username === to.username &&
              element.members[1].username === from.username) ||
            (element.members[0].username === from.username &&
              element.members[1].username === to.username)
          ) {
            dk = 0;
          }
        });
        if (dk == 1 && to && from) {
          const members = [];
          members.push(to);
          members.push(from);
          const room = new Chat({
            members,
          });
          room.save();
          return room;
        } else throw new Error("Bạn đã là bạn của người này rồi");
      } catch (error) {
        throw new Error(error);
      }
    },
    async deleteRoomChat(_, { roomId }) {
      const room = await Chat.findById(roomId);
      if (room) {
        await room.delete();
      } else {
        throw new Error("Khong tim thay phong nay");
      }
      return "Xoa thanh cong";
    },
    async createContentChat(_, { roomId, content, image }, context) {
      const { username } = checkAuth(context);
      const user = await User.findOne({ username: username });
      cloudinary.config({
        cloud_name: "web-img",
        api_key: "539575672138879",
        api_secret: "9ELOxX7cMOVowibJjcVMV9CdN2Y",
      });
      var uri = null;
      if (content.trim() === "" && image.trim() === "") {
        throw new Error("Nội dung chat,image không được để trống ");
      } else if (image.trim() !== "") {
        const result = await cloudinary.v2.uploader.upload(image, {
          allowed_formats: ["jpg", "png", "gif"],
          public_id: "",
          folder: "Chat",
        });
        uri = result.url;
      }
      const chat = await Chat.findById(roomId);

      if (chat) {
        chat.content.push({
          username,
          createdAt: new Date().toISOString(),
          content,
          displayname: user.displayname,
          image: uri,
        });
        await chat.save();
        return chat;
      } else {
        throw new Error("Không tìm thấy id phòng");
      }
    },
    async addMembers(_,{roomId,userId}){
      const room=await Chat.findById(roomId);
      for(var i=0;i<userId.length;i++){
        const user=await User.findById(userId[i]);
        if(user && isUser(room.members,user.username)===false){
          room.members.push(user)
        }
      }
      await room.save()
      return true;
    }
  },
};
