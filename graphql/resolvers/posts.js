const { AuthenticationError, UserInputError } = require('apollo-server');


const Post = require('../../models/Post');
const PaginatedPost = require('../../models/PaginatedPost')
const checkAuth = require('../../util/check-auth');
const cloudinary = require("cloudinary");
const User = require('../../models/User.js');
module.exports = {
  Query: {
    async getPosts(_, { cursor, limit }) {
      const posts = await Post.find().sort({createdAt:-1})

      for(var i=0;i<posts.length;i++){
        const user =await User.findOne({username:posts[i].username})
        posts[i].displayname=user.displayname
        posts[i].avatar=user.profile.avatar
        const comments=posts[i].comments;

        for(var j=0;j<posts[i].comments.length;j++){
          const user =await User.findOne({username:comments[j].username})
          comments[j].displayname=user.profile.fullName
          comments[j].avatar=user.profile.avatar
        }
        posts[i].comments=comments;
        await posts[i].save()
      }

      var start = 0;
      if (cursor) {
        for (var i = 0; i < posts.length; i++) {
          if (Date.parse(posts[i].createdAt) < Date.parse(cursor) ) {
            start = i;
            i = posts.length;          
          }
          else start=posts.length
        }
      }
      const postHas = new PaginatedPost({
        hasMore: limit <= posts.length - start,
        posts: posts.splice(start, limit)
      })
      return postHas

    },
    async getMyPosts(_, { cursor, limit },context) {
      const user=checkAuth(context)
      const posts = await Post.find({username:user.username})
      const values=posts.reverse()
      var start = 0;
      var hasMore = true;
      if (cursor) {
        for (var i = 0; i < values.length; i++) {
          if (Date.parse(values[i].createdAt) < Date.parse(cursor)) {
            start = i;
            i = values.length;
          }
        }
      }
      if (limit > values.length - start) {
        hasMore = false
      }
      const postHas = new PaginatedPost({
        hasMore: hasMore,
        posts: values.splice(start, limit)
      })
      return postHas

    },
    async getPost(_, { postId }) {
      try {   
        const post = await Post.findById(postId);
        if (post) {  
          const contents=post.comments;
          const user=await User.findOne({username:post.username});
          post.displayname=user.displayname
          post.avatar=user.profile.avatar
          for(var i=0;i<contents.length;i++){
            const user=await User.findOne({username:contents[i].username});
            contents[i].displayname=user.profile.fullName
            contents[i].avatar=user.profile.avatar
          }  
          post.comments=contents;
          await post.save();
          return post;
          
        } else {
          throw new Error('Không tìm thấy bài post');
        }
      } catch (err) {
        throw new Error(err);
      }
    }
  },
  Mutation: {
    async createPost(_, { body, image }, context) {
      var uri = "";
      if(image){
      cloudinary.config({
        cloud_name: 'web-img',
        api_key: '539575672138879',
        api_secret: '9ELOxX7cMOVowibJjcVMV9CdN2Y'
      });
         const result = await cloudinary.v2.uploader.upload(image, {
          allowed_formats: ["jpg", "png"],
          public_id: "",
          folder: "posts",
        });
        uri = result.url; 
      }
        const user= checkAuth(context);
        const me=await User.findOne({username:user.username})
        if (body.trim() === '') {
          throw new Error('Nội dung bài post không được để trống');
        }
    
        displayname=me.displayname
        if(displayname===undefined){
          displayname=user.username
        }     
        const newPost = new Post({
          body,
          image: uri,
          user: user.id,
          username: user.username,
          createdAt: new Date().toISOString(),
          displayname ,
          avatar:me.profile.avatar     
        });
         const post = await newPost.save();
        context.pubsub.publish('NEW_POST', {
          newPost: post
        }); 
        return post;
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return 'Post deleted successfully';
        } else {
          throw new AuthenticationError('Action not allowed');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = checkAuth(context);

      const user=await User.findOne({username:username})
     /*  console.log(user.displayname,user.profile.avatar) */
      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // Post already likes, unlike it
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // Not liked, like post
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
            displayname:user.displayname,
            avatar:user.profile.avatar,
          });
        }

        await post.save();
        return post;
      } else throw new UserInputError('Post not found');
    },

    async Upload(_, { file }) {
      cloudinary.config({
        cloud_name: 'web-img',
        api_key: '539575672138879',
        api_secret: '9ELOxX7cMOVowibJjcVMV9CdN2Y'
      });

      try {

        const result = await cloudinary.v2.uploader.upload(file, {
          allowed_formats: ["jpg", "png"],
          public_id: "",
          folder: "posts",
        });
        return `Successful-Photo URL: ${result.url}`;
      } catch (e) {

        return `Image could not be uploaded:${e.message}`;
      }


    }
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
    }
  }
};