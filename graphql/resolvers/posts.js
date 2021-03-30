const { AuthenticationError, UserInputError } = require('apollo-server');


const Post = require('../../models/Post.js');
const PaginatedPost = require('../../models/PaginatedPost')
const checkAuth = require('../../util/check-auth');
const cloudinary = require("cloudinary");
const User = require('../../models/User.js');
module.exports = {
  Query: {
    async getPosts(_, { cursor, limit }) {
      const posts = await Post.find()
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
        const user= checkAuth(context);
      
        if (body.trim() === '') {
          throw new Error('Nội dung bài post không được để trống');
        }
        displayname=user.displayname
        if(user.displayname===undefined){
          displayname=user.username
        }     
        const newPost = new Post({
          body,
          image: uri,
          user: user.id,
          username: user.username,
          createdAt: new Date().toISOString(),
          displayname        
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

      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // Post already likes, unlike it
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // Not liked, like post
          post.likes.push({
            username,
            createdAt: new Date().toISOString()
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