const {gql}=require('apollo-server')

module.exports=gql`
    type Post{
        id:ID!,
        body:String!,
        createdAt:String!,
        username:String!, 
        image:[String]
        verified:Boolean     
        comments: [Comment]!
        likes: [Like]!
        likeCount: Int!
        commentCount: Int!
        displayname:String!
        avatar:String
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
        avatar:String
       
    }
    type Like {
        id: ID!
        createdAt: String!
        username: String!
        displayname:String!
        avatar:String
    }

    type RoomChat{
        id:ID!
        content:[Chat]!
        members:[User]!
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
    type Product{
        id:ID!,
        price:String!
        body:String!,
        address:String!
        createdAt:String!,    
        image:String,
        category:String!,   
        seller:User!,
        describe:String
    }
  
    type ProductResponse{
        error: [FieldError!]
        product: Product
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
        coverImage:String
    }
 
    type Follow{
        id:ID!
        username:String!
        createdAt:String!
        displayname:String!
        avatar:String
        story:String
    }
    type Notification{
        id:ID!,
        type:String!,
        title:String!,
        createdAt:String!,
        displayname:String!,
        username:String!,
        avatar:String,
        whose:String!
        watched:Boolean!
    }
    type Notifications{
        count:String!
        notifications:[Notification]
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
        getMyPosts(username:String!,cursor:String,limit:Int!):PaginatedPost!       
        getChats:[RoomChat]
        getChat(roomId:ID):RoomChat
        getChatReverse(roomId:ID):RoomChat
        getUsers:[User]
        getUser(username:String!):User
        getMyUser:User
        getUserFollowing:[User]
        getRoomChat:[RoomChat]
        
        getGroups:[GroupChat]
        getGroup(groupId:ID!):GroupChat
        getGroupChat:[GroupChat]

        getNotification:Notifications
        getProducts:[Product]
        getProduct(productId:ID!):Product
        getMyProducts:[Product]
        getIncreasedProducts:[Product]
        getDecreasedProducts:[Product]
        FilterProducts(category:String!,address:String!):[Product]
        FilterProductsByCategory(category:String!):[Product]
        FilterProductsByAddress(address:String!):[Product]
        
    }
    
    type Mutation{
        register(registerInput:RegisterInput):UserResponse!
        login(username:String!,password:String!):UserResponse!
        Upload(file: String!): String
        findUsers(displayname:String!):[User]
        
        createPost(body: String,image:[String]):Post!
        deletePost(postId:ID!):String!
        createComment(postId: String!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
        createRoomChat(userId:String!):RoomChat!
        deleteRoomChat(roomId:ID!):String
        createContentChat(roomId:String!,content:String!):RoomChat!
        createGroupChat(body:String!):GroupChat!
        createContentGroupChat(groupId:String!,content:String!):GroupChat!
        createMember(groupId:String!,username:String!):GroupChat!       
        following(username:String):User!

        editProfile(avatar:String, dateOfBirth:String, fullName:String! , story:String,coverImage:String):User!
        createProduct(image:String!,price:String!,
                      address:String!,body:String!,
                      category:String!,describe:String):ProductResponse!
        setWatchedTrue:[Notification]

        deleteProduct(productId:ID!):String!
    }
    type Subscription {
        newPost: Post!
    }
`;