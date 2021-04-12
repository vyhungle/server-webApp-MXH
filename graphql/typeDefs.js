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
        displayname:String!
        avatar:String!
    }

    type File{
        url:String!
    }
    
    type PaginatedPost{
        hasMore:Boolean!,
        posts:[Post!]!
    }
    type Comment {
        id: ID!
        createdAt: String!
        username: String!
        displayname:String!
        body: String!
        avatar:String!
       
    }
    type Like {
        id: ID!
        createdAt: String!
        username: String!
        displayname:String!
        avatar:String!
    }

    type RoomChat{
        id:ID!
        from:User!
        to:User!
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
        displayname:String!
        createdAt:String!
        content:String!
    }
    type Member{
        id:ID!
        username:String!
        createdAt:String!
    }

    type User {
        id: ID
        email:String
        token:String
        username:String
        createdAt:String
        displayname:String
        profile:Profile
        following:[Follow!]
        follower:[Follow]
    }

    type UserResponse {
        error: [FieldError!]
        user: User!
    }

    type FieldError {
        field: String!
        message: String!
    }
    type Profile{
        avatar:String      
        dateOfBirth:String
        fullName:String
        story:String
    }
 
    type Follow{
        id:ID!
        username:String!
        createdAt:String!
        displayname:String!
        avatar:String!
    }
    input RegisterInput {
        username:String!
        password:String!
        confirmPassword: String!
        email: String!
        displayname:String!
    }
    type Query{
        getPosts(cursor:String,limit:Int!):PaginatedPost!
        getPost(postId: ID!): Post!
        getMyPosts(cursor:String,limit:Int!):PaginatedPost!       
        getChats:[RoomChat]
        getChat(roomId:ID!):RoomChat
        getUsers:[User]
        getUser(username:String!):User
        getRoomChat:[RoomChat]
        getGroups:[GroupChat]
        getGroup(groupId:ID!):GroupChat
        getGroupChat:[GroupChat]

      
        
    }
    
    type Mutation{
        register(registerInput:RegisterInput):UserResponse!
        login(username:String!,password:String!):UserResponse!
        Upload(file: String!): String
        findUsers(displayname:String!):[User]
        
        createPost(body: String,image:String):Post!
        deletePost(postId:ID!):String!
        createComment(postId: String!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
        createRoomChat(userId:String!):RoomChat!
        createContentChat(roomId:String!,content:String!):RoomChat!
        createGroupChat(body:String!):GroupChat!
        createContentGroupChat(groupId:String!,content:String!):GroupChat!
        createMember(groupId:String!,username:String!):GroupChat!
        following(username:String):User!

        editProfile(avatar:String!, dateOfBirth:String!, fullName:String! , story:String!):User!
    }
    type Subscription {
        newPost: Post!
    }
`;