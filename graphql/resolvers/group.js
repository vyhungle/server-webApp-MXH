const TypeGroup = require("../../models/TypeGroup");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Group = require("../../models/Group");
const cloudinary = require("cloudinary");
const checkAuth = require("../../util/check-auth");
const { validateGroupInput } = require("../../util/validators");

module.exports = {
  Query: {
    async getTypeGroup(_, {}) {
      const type = await TypeGroup.find();
      console.log(type);
      return type;
    },
    async getGroups(_, {}) {
      const groups = await Group.find();
      if (groups) return groups;
      else throw new Error("khong tim thay group");
    },
  },
  Mutation: {
    async createGroup(
      _,
      { name, describe, imageCover, typeGroup, public },
      context
    ) {
      try {
        const { errors, valid } = validateGroupInput(
          name,
          describe,
          imageCover,
          typeGroup
        );
  
        var err = errors.split(",");
        const groupResponse = { error: [], group: null };
        if (!valid) {
          for (var i = 0; i < err.length - 1; i = i + 2) {
            groupResponse.error.push({
              field: err[i + 1],
              message: err[i],
            });
          }
        } else {
          cloudinary.config({
            cloud_name: "web-img",
            api_key: "539575672138879",
            api_secret: "9ELOxX7cMOVowibJjcVMV9CdN2Y",
          });
          const result = await cloudinary.v2.uploader.upload(imageCover, {
            allowed_formats: ["jpg", "png", "gif"],
            public_id: "",
            folder: "Group",
          });
          imageCover = result.url.toString();
  
          const type = await TypeGroup.findOne({ name: typeGroup });
          const ct = checkAuth(context);
          const leader = await User.findOne({ username: ct.username });
          const newGroup = new Group({
            leader,
            name,
            describe,
            imageCover,
            typeGroup: type,
            public,
            createdAt: new Date().toISOString(),
          });
          const group = await newGroup.save();
          context.pubsub.publish("NEW_GROUP", {
            newGroup: group,
          });
          
          groupResponse.group=group;
        }
  
        return groupResponse;
      } catch (error) {
        throw new Error ("zang source")
      }
    },
    async createPostInGroup(_, { groupId, body, image }, context) {
      try {
        var uri = [];
        for (var i = 0; i < image.length; i++) {
          if (image[i]) {
            cloudinary.config({
              cloud_name: "web-img",
              api_key: "539575672138879",
              api_secret: "9ELOxX7cMOVowibJjcVMV9CdN2Y",
            });
            const result = await cloudinary.v2.uploader.upload(image[i], {
              allowed_formats: ["jpg", "png", "gif"],
              public_id: "",
              folder: "postsGroup",
            });
            uri.push(result.url.toString());
          }
        }
        const user = checkAuth(context);
        const me = await User.findOne({ username: user.username });
        if (body.trim() === "") {
          throw new Error("Nội dung bài post không được để trống");
        }
        const post = new Post({
          body,
          image: uri,
          user: user.id,
          username: user.username,
          createdAt: new Date().toISOString(),
          displayname: me.displayname,
          avatar: me.profile.avatar,
        });

        const group = await Group.findById(groupId);
        group.posts.push(post);
        await group.save();
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};
