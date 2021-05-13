const postsResolvers=require('./posts');
const usersResolvers=require('./users');
const commentResolvers=require('./comment');
const ChatsResolver=require('./Chat');
const NotificationResolver=require("./notification")
const ProductResolver=require("./product");
const GroupResolver=require("./group");

module.exports ={
    Post: {       
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length      
    },
    Query:{
        ...postsResolvers.Query,
        ...ChatsResolver.Query,
        ...usersResolvers.Query,
        ...NotificationResolver.Query,
        ...ProductResolver.Query,
        ...GroupResolver.Query,
    },
    Mutation:{
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentResolvers.Mutation,
        ...ChatsResolver.Mutation,
        ...ProductResolver.Mutation,
        ...NotificationResolver.Mutation,
        ...GroupResolver.Mutation,
    },
    Subscription: {
        ...postsResolvers.Subscription
        
    }
};