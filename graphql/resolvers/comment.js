const { AuthenticationError, UserInputError } = require('apollo-server');

const checkAuth = require('../../util/check-auth');
const Post = require('../../models/Post');
const User = require('../../models/User');

module.exports = {
  Mutation: {
        createComment: async (_, { postId, body }, context) => 
        {
            const { username,displayname } = checkAuth(context);
            const me=await User.findOne({username:username})

            if (body.trim() === '') 
            {
                throw new UserInputError('Empty comment', {
                errors: {
                    body: 'Comment body must not empty'
                }
                });
            }
            var name=""
            name=displayname
            if(displayname===undefined){
              name=username
            }
            const post = await Post.findById(postId);

            if (post) {
                post.comments.unshift({
                body,
                username,
                createdAt: new Date().toISOString(),
                displayname:name,
                avatar:me.profile.avatargit
                });
                await post.save();
                return post;
            } else throw new UserInputError('Post not found');
        },
        async deleteComment(_, { postId, commentId }, context) 
        {
            const { username } = checkAuth(context);
      
            const post = await Post.findById(postId);
      
            if (post) {
              const commentIndex = post.comments.findIndex((c) => c.id === commentId);
      
              if (post.comments[commentIndex].username === username || post.username===username) {
                post.comments.splice(commentIndex, 1); // splice xoa phan tu thu index
                await post.save();
                return post;
              } else {
                throw new AuthenticationError('Action not allowed');
              }
            } else {
              throw new UserInputError('Post not found');
            }
        }
    }
};