const {gql}=require('apollo-server')

module.exports=gql`
    type Post{
        id:ID!,
        body:String!,
        createdAt:String!,
        username:String!,     
        image:String
        verified:Boolean
        comments: [Comment]!
        likes: [Like]!
        likeCount: Int!
        commentCount: Int!
    }
   
    type Comment {
        id: ID!
        createdAt: String!
        username: String!
        body: String!
    }
    type Like {
        id: ID!
        createdAt: String!
        username: String!
    }

    type RoomChat{
        id:ID!
        from:String!
        to:String!
        content:[Chat]!
    }
    type GroupChat{
        id:ID!
        body:String!
        leader:String!
        members:[Member]!
        content:[Chat]!
    }
    type Chat{
        id:ID!
        username:String!
        createdAt:String!
        content:String!
    }
    type Member{
        id:ID!
        username:String!
        createdAt:String!
    }

    type User {
        id: ID!
        email:String!
        token:String
        username:String!
        createdAt:String!
        displayname:String  
        friends:[Friend]! 
        profile:Profile!
    }
    type Profile{
        id:ID
        avatar:String
        dateOfBirth:String
        fullName:String
        story:String
        follower:String
        following:String
    }
    type Friend{
        id:ID!
        username:String!
        createdAt:String!
    }
    input RegisterInput {
        username:String!
        password:String!
        confirmPassword: String!
        email: String!
    }
    type Query{
        getPosts(cursor:String!,limit:Int!):[Post]
        getPost(postId: ID!): Post
        getChats:[RoomChat]
        getChat(roomId:ID!):RoomChat
        getUsers:[User]
        getUser:User
        getRoomChat(username:String!):[RoomChat]
        getGroups:[GroupChat]
        getGroup(groupId:ID!):GroupChat
        getGroupChat:[GroupChat]
        
    }
    
    type Mutation{
        register(registerInput:RegisterInput):User!
        login(username:String!,password:String!):User!
        createPost(body: String!,image:String!):Post!
        deletePost(postId:ID!):String!
        createComment(postId: String!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
        createRoomChat(username:String!):RoomChat!
        createContentChat(roomId:String!,content:String!):RoomChat!
        createGroupChat(body:String!):GroupChat!
        createContentGroupChat(groupId:String!,content:String!):GroupChat!
        createMember(groupId:String!,username:String!):GroupChat!
        addFriend(username:String!):User!

        editProfile(avatar:String!, dateOfBirth:String!, fullName:String! , story:String!):User!
    }
    type Subscription {
        newPost: Post!
    }
`;