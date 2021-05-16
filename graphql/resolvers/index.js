const postsResolvers=require('./posts');
const usersResolvers=require('./users');
const commentResolvers=require('./comment');
const ChatsResolver=require('./Chat');
const NotificationResolver=require("./notification")
const ProductResolver=require("./product");
const GroupResolver=require("./group");
const InviteResolver=require("./invite");
const JoinResolver=require("./join");

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
        ...InviteResolver.Query,
        ...JoinResolver.Query,
    },
    Mutation:{
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentResolvers.Mutation,
        ...ChatsResolver.Mutation,
        ...ProductResolver.Mutation,
        ...NotificationResolver.Mutation,
        ...GroupResolver.Mutation,
        ...InviteResolver.Mutation,
        ...JoinResolver.Mutation,
    },
    Subscription: {
        ...postsResolvers.Subscription
        
    }
};