const { AuthenticationError, UserInputError } = require("apollo-server");
const { formatError } = require("graphql");
const cloudinary = require("cloudinary");

const Chat = require("../../models/Chat.js");
const User = require("../../models/User.js");
const checkAuth = require("../../util/check-auth");
const { isUser, isMember } = require("../../util/function/chat.js");

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
    async getRoomChat(_, {}, context) {
      let values = [];
      const user = checkAuth(context);
      var id = user.id;
      try {
        const chat = await Chat.find();
        chat.forEach((element) => {
          element.members.map((m) => {
            if (m.id === id && m.stay === true) values.push(element);
          });
        });
        // console.log(values.leave)
        return values;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createRoomChat(_, { userId }, context) {
      const user = checkAuth(context);
      const from = await User.findById(user.id);
      const to = await User.findById(userId[0]);
      const members = [];
      members.push({ ...to._doc, stay: true });
      members.push({ ...from._doc, stay: true });
      const rooms = await Chat.find();
      var room;
      if (userId.length === 1) {
        rooms.map((r) => {
          if (r.members.length === 2) {
            if (
              (r.members[0].id === userId[0] && r.members[1].id === user.id) ||
              (r.members[1].id === userId[0] && r.members[0].id === user.id)
            ) {
              room = r;
            }
          }
        });

        if (room) {
          const updateRoom = await Chat.findById(room.id);
          updateRoom.members = members;
          await updateRoom.save();
          return room.id;
        } else {
          const room = new Chat({
            members,
          });
          await room.save();
          return room.id;
        }
      } else {
        for (var i = 1; i < userId.length; i++) {
          const member = await User.findById(userId[i]);
          members.push({
            ...member._doc,
            stay: true,
          });
        }
        const room = new Chat({
          members,
          name: `Nhóm của ${from.displayname}`,
          image: "",
        });
        await room.save();
        return room.id;
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
          avatar:user.profile.avatar
        });
        await chat.save();
        return chat;
      } else {
        throw new Error("Không tìm thấy id phòng");
      }
    },
    async addMembers(_, { roomId, userId }) {
      const room = await Chat.findById(roomId);
      for (var i = 0; i < userId.length; i++) {
        const user = await User.findById(userId[i]);
        if (user && isUser(room.members, user.username) === false) {
          room.members.push({ ...user._doc, stay: true });
        }
      }
      await room.save();
      return true;
    },
    async leaveTheRoom(_, { roomId }, context) {
      const room = await Chat.findById(roomId);
      if (room) {
        const ct = checkAuth(context);
        const index = room.members.findIndex((x) => x.username === ct.username);
        console.log(index);
        (room.members[index].stay = false), await room.save();
        return true;
      }

      return false;
    },
    async joinTheRoom(_, { roomId, userIds }) {
      const room = await Chat.findById(roomId);
      if (room) {
        for (var id of userIds) {
          if (isMember(room.members, id) === false) {
            const user = await User.findById(id);
            room.members.push({ ...user._doc, stay: true });
            await room.save();
          } else {
            const index = room.members.findIndex((x) => x.id === id);
            room.members[index].stay = true;
            await room.save();
          }
        }
        return true;
      }
      return false;
    },

    async editRoom(_, { roomId, image, name }) {
      const room = await Chat.findById(roomId);
      cloudinary.config({
        cloud_name: "web-img",
        api_key: "539575672138879",
        api_secret: "9ELOxX7cMOVowibJjcVMV9CdN2Y",
      });
      var uri = "";
      if (image.trim() !== "") {
        const result = await cloudinary.v2.uploader.upload(image, {
          allowed_formats: ["jpg", "png", "gif"],
          public_id: "",
          folder: "Chat",
        });
        uri = result.url;
      }
      if (room) {
        (room.image = uri), (room.name = name), await room.save();
        return true;
      }
      return false;
    },
  },
};
