const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('../../models/Post.js');
const PaginatedPost = require('../../models/PaginatedPost')
const checkAuth = require('../../util/check-auth');

module.exports = {
  Query: {
    async getPosts(_, { cursor, limit }) {
      const posts = await Post.find().sort({createdAt:-1});
      const value = posts
    
      var start=0;
      var hasMore=true;
      if(cursor){
        for (var i = 0; i < value.length; i++) {
          if (Date.parse(value[i].createdAt) < Date.parse(cursor)) {
            start = i;
            i = value.length;
          }
        }   
      }
      if(limit>value.length-start){
          hasMore=false
      }
      const postHas = new PaginatedPost({
        hasMore: hasMore,
        posts: value.splice(start,limit)
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
      const user = checkAuth(context);
      if (body.trim() === '') {
        throw new Error('Nội dung bài post không được để trống');
      }

      const newPost = new Post({
        body,
        image,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
        displayname: user.profile.displayname
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
    }

  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
    }
  }
};