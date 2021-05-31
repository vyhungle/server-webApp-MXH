const TypeGroup = require("../../models/TypeGroup");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Group = require("../../models/Group");
const Notification = require("../../models/Notification");
const cloudinary = require("cloudinary");
const checkAuth = require("../../util/check-auth");
const {
  validateGroupInput,
  checkUserInGroup,
} = require("../../util/validators");
const { CountMembers, Posts, RefGroup } = require("../../util/function/group");

module.exports = {
  Query: {
    async getTypeGroup(_, {}) {
      const type = await TypeGroup.find();
      return type;
    },
    async getGroups(_, {}) {
      const groups = await Group.find();
      if (groups) return CountMembers(groups);
      else throw new Error("khong tim thay group");
    },
    async getMyGroups(_, {}, context) {
      const ct = checkAuth(context);
      const groups = await Group.find();
      const values = groups.filter(
        (x) => checkUserInGroup(ct.username, x.members) === true
      );
      return CountMembers(values);
    },
    async getPostInMyGroup(_, {}, context) {
      const ct = checkAuth(context);
      const groups = await Group.find();
      const values = groups.filter(
        (x) => checkUserInGroup(ct.username, x.members) === true
      );
      const posts = [];
      values.map((g) => {
        g.posts.map((p) => {
          const post = [];
          post.post = Posts(p);
          post.groupId = g.id;
          post.groupName = g.name;
          posts.push(post);
        });
      });

      return posts.reverse();
    },
    async getGroup(_, { groupId }) {
      const group = await Group.findById(groupId);
      group.posts = group.posts.reverse();
      return RefGroup(group);
    },
    async getCommentInGroup(_, { groupId, postId }) {
      const group = await Group.findById(groupId);
      const comments = [];
      group.posts.map((p) => {
        if (p.id === postId) {
          p.comments.map((c) => {
            comments.push(c);
          });
        }
      });
      return comments;
    },
    async getPostInGroup(_, { groupId, postId }) {
      const group = await Group.findById(groupId);
      var post;
      group.posts.map((p) => {
        if (p.id === postId) post = p;
      });
      return post;
    },
    async findGroups(_, { name }) {
      const group = await Group.find();
      let values = group.filter(
        (i) => i.name.toLowerCase().indexOf(name.toLowerCase()) > -1
      );
      return values;
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
          const members = [];
          members.push({ ...leader._doc, id: leader._id });
          const newGroup = new Group({
            leader,
            members,
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

          group.countMembers = 1;
          groupResponse.group = group;
        }

        return groupResponse;
      } catch (error) {
        throw new Error(error);
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
    async likePostInGroup(_, { groupId, postId }, context) {
      const ct = checkAuth(context);
      const user = await User.findOne({ username: ct.username });
      const group = await Group.findById(groupId);
      var ref = "khong tim thay post!";
      group.posts.map(async (p) => {
        if (p.id === postId) {
          if (p.likes.find((like) => like.username === ct.username)) {
            // Post already likes, unlike it
            p.likes = p.likes.filter((like) => like.username !== ct.username);
            ref = "Dislike";
          } else {
            // Not liked, like post
            p.likes.push({
              username: user.username,
              createdAt: new Date().toISOString(),
              displayname: user.displayname,
              avatar: user.profile.avatar,
            });
            const newNotification = new Notification({
              type: "Like",
              title: `đã thích bài viết của bạn trong ${group.name}`,
              createdAt: new Date().toISOString(),
              displayname: user.displayname,
              username: user.username,
              avatar: user.profile.avatar,
              whose: p.username,
              watched: false,
            });
            const notification = await newNotification.save();
            context.pubsub.publish("NEW_NOTIFICATION", {
              newNotification: notification,
            });
            ref = "Like";
          }
        }
      });
      await group.save();
      return ref;
    },
    async CommentPostInGroup(_, { groupId, postId, body }, context) {
      const ct = checkAuth(context);
      const user = await User.findOne({ username: ct.username });
      const group = await Group.findById(groupId);
      let ref = false;
      group.posts.map(async (p) => {
        if (p.id === postId) {
          p.comments.unshift({
            body,
            username: user.username,
            createdAt: new Date().toISOString(),
            displayname: user.displayname,
            avatar: user.profile.avatar,
          });
          const newNotification = new Notification({
            type: "Comment",
            title: `đã bình luận về bài viết của bạn trong ${group.name}`,
            createdAt: new Date().toISOString(),
            displayname: user.displayname,
            username: user.username,
            avatar: user.profile.avatar,
            whose: p.username,
            watched: false,
          });
          const notification = await newNotification.save();
          context.pubsub.publish("NEW_NOTIFICATION", {
            newNotification: notification,
          });
          ref = true;
        }
      });
      await group.save();
      return ref;
    },

    async deletePostInGroup(_,{groupId,postId}){
      const group=await Group.findById(groupId);
      const index=group.posts.findIndex(x=>x.id===postId)
      if(index>=0){
        group.posts.splice(index,1);
        await group.save();
        return true
      }
      return false;
    
    },
    async leaveTheGroup(_,{groupId},context){
      const ct=checkAuth(context)
      const group=await Group.findById(groupId);
      const index=group.members.findIndex(x=>x.username===ct.username)
      if(index>=0){
        group.members.splice(index,1);
        await group.save();
        return true
      }
      return false;
    }
  },
};
