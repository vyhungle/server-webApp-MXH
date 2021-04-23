const postsResolvers=require('./posts');
const usersResolvers=require('./users');
const commentResolvers=require('./comment');
const ChatsResolver=require('./Chat');
const GroupChatReolver=require('./GroupChat');
const NotificationResolver=require("./notification")
const ProductResolver=require("./product");

module.exports ={
    Post: {       
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length      
    },
    Query:{
        ...postsResolvers.Query,
        ...ChatsResolver.Query,
        ...usersResolvers.Query,
        ...GroupChatReolver.Query,
        ...NotificationResolver.Query,
        ...ProductResolver.Query
    },
    Mutation:{
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentResolvers.Mutation,
        ...ChatsResolver.Mutation,
        ...GroupChatReolver.Mutation,
        ...ProductResolver.Mutation,
        ...NotificationResolver.Mutation
    },
    Subscription: {
        ...postsResolvers.Subscription
        
    }
};