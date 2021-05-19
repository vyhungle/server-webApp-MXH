const { gql } = require("apollo-server");

module.exports = gql`
  type Post {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
    image: [String]
    verified: Boolean
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
    displayname: String!
    avatar: String
  }

  type File {
    url: String!
  }

  type PaginatedPost {
    hasMore: Boolean!
    posts: [Post!]!
  }
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    displayname: String!
    body: String!
    avatar: String
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
    displayname: String!
    avatar: String
  }

  type RoomChat {
    id: ID!
    content: [Chat]!
    members: [User]!
  }
  # type GroupChat {
  #   id: ID!
  #   body: String!
  #   leader: String!
  #   members: [Member]!
  #   content: [Chat]!
  # }

  type Chat {
    id: ID!
    username: String!
    displayname: String!
    createdAt: String!
    content: String
    image: String
  }
  type Member {
    id: ID!
    username: String!
    createdAt: String!
  }

  type User {
    id: ID
    email: String
    token: String
    username: String
    createdAt: String
    displayname: String
    profile: Profile
    following: [Follow!]
    follower: [Follow]
  }

  type UserResponse {
    error: [FieldError!]
    user: User!
  }
  type Product {
    id: ID!
    price: String!
    body: String!
    address: Location
    createdAt: String!
    image: [String]
    category: Category
    seller: User!
    describe: String
  }
  type Category {
    id: ID!
    name: String!
    slug: String!
  }
  type Location {
    id: ID!
    location: String!
    zipcode: String!
  }
  type ProductResponse {
    error: [FieldError!]
    product: Product
  }

  type FieldError {
    field: String!
    message: String!
  }
  type Profile {
    avatar: String
    dateOfBirth: String
    fullName: String
    story: String
    coverImage: String
  }

  type Follow {
    id: ID!
    username: String!
    createdAt: String!
    displayname: String!
    avatar: String
    story: String
  }
  type Notification {
    id: ID!
    type: String!
    title: String!
    createdAt: String!
    displayname: String!
    username: String!
    avatar: String
    whose: String!
    watched: Boolean!
  }
  type Notifications {
    count: String!
    notifications: [Notification]
  }

  type TypeGroup {
    name: String!
    slug: String!
  }
  type Join {
    id: ID!
    groupId: String!
    name: String!
    imageCover: String!
    member: User!
  }
  type Group {
    id: ID!
    leader: User!
    admins: [User]
    members: [User]!
    typeGroup: TypeGroup!
    name: String!
    imageCover: String!
    countMembers: String!
    public: Boolean!
    describe: String!
    posts: [Post]
    createdAt: String!
    joins:[Join]
  }
  type PostInGroup {
    groupId: String!
    groupName: String!
    post: Post!
  }
  type GroupResponse {
    error: [FieldError!]
    group: Group
  }

  type Invite {
    id: ID!
    groupId: String!
    name: String!
    imageCover: String!
    to: User!
    from: User!
  }


  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
    displayname: String!
  }
  type Query {
    getPosts(cursor: String, limit: Int!): PaginatedPost!
    getPost(postId: ID!): Post!
    getMyPosts(username: String!, cursor: String, limit: Int!): PaginatedPost!
    getChats: [RoomChat]
    getChat(roomId: ID): RoomChat
    getChatReverse(roomId: ID): RoomChat
    getUsers: [User]
    getUser(username: String!): User
    getMyUser: User
    getUserFollowing: [User]
    getRoomChat: [RoomChat]
    findUsers(displayname: String!): [User]

    # getGroup(groupId: ID!): GroupChat
    # getGroupChat: [GroupChat]

    getNotification: Notifications

    getProduct(productId: ID!): Product

    getMyProducts: [Product]
    getProducts(category: String, address: String, sort: Int): [Product]
    getCategories: [Category]
    getLocations: [Location]

    getTypeGroup: [TypeGroup]!
    getGroups: [Group]!
    getMyGroups: [Group]!
    getPostInMyGroup: [PostInGroup]!
    getGroup(groupId: String!): Group!
    getCommentInGroup(groupId: String!, postId: String!): [Comment]!
    getPostInGroup(groupId: String!, postId: String!): Post!
    findGroups(name:String!):[Group]!

    getMyInvites:[Invite]!
    getJoinInGroup(groupId:String!):[Join]!
  }

  type Mutation {
    register(registerInput: RegisterInput): UserResponse!
    login(username: String!, password: String!): UserResponse!
    Upload(file: String!): String
    findUsers(displayname: String!): [User]

    createPost(body: String, image: [String]): Post!
    deletePost(postId: ID!): String!
    createComment(postId: String!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
    createRoomChat(userId: [String]!): String!
    
    createRoomChatUsername(username: String!): RoomChat!
    deleteRoomChat(roomId: ID!): String
    createContentChat(
      roomId: String!
      content: String
      image: String
    ): RoomChat!

    following(username: String): User!

    editProfile(
      avatar: String
      dateOfBirth: String
      fullName: String!
      story: String
      coverImage: String
    ): User!
    createProduct(
      image: [String]!
      price: String!
      address: String!
      body: String!
      category: String!
      describe: String
    ): ProductResponse!
    setWatchedTrue: [Notification]

    deleteProduct(productId: ID!): String!

    createGroup(
      name: String!
      describe: String!
      imageCover: String!
      typeGroup: String!
      public: Boolean!
    ): GroupResponse!

    createPostInGroup(groupId: String!, body: String, image: [String]): Boolean!
    likePostInGroup(groupId: String!, postId: String!): String!
    CommentPostInGroup(
      groupId: String!
      postId: String!
      body: String!
    ): Boolean!
    deletePostInGroup(groupId:String!,postId:String!):Boolean!

    createInvite(groupId:String!,userId:String!):Boolean!
    acceptInvite(groupId:String!,userId:String!,inviteId:String!):Boolean!
    removeInvite(inviteId:String!):Boolean!

    createJoin(groupId:String!):Boolean!
    acceptJoin(groupId:String!,userId:String!,joinId:String!):Boolean!
    removeJoin(groupId:String!,joinId:String!):Boolean!
  }
  type Subscription {
    newPost: Post!
  }
`;
