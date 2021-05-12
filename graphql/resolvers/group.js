const TypeGroup = require("../../models/TypeGroup");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Group = require("../../models/Group");
const cloudinary = require("cloudinary");
const checkAuth = require("../../util/check-auth");

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
        if(imageCover) {
          cloudinary.config({
            cloud_name: "web-img",
            api_key: "539575672138879",
            api_secret: "9ELOxX7cMOVowibJjcVMV9CdN2Y",
          });
          const result =await cloudinary.v2.uploader.upload(imageCover, {         
            allowed_formats: ["jpg", "png" , "gif"],
            public_id: "",
            folder: "Group",
          });
          imageCover=result.url.toString();
        }
        const type=await TypeGroup.findOne({name:typeGroup})
        console.log(type)
        const ct = checkAuth(context);
        const leader=await User.findOne({username:ct.username})
        if(type===null) return false
        const newGroup = new Group({
          leader,
          name,
          describe,
          imageCover,
          typeGroup:type,
          public,
          createdAt: new Date().toISOString(),
        });
        const group = await newGroup.save();
        context.pubsub.publish("NEW_GROUP", {
          newGroup: group,
        });
        return true;
      } catch (error) {
        return false;
      }

    },
  },
};
