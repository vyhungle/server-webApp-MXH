const { model, Schema } = require('mongoose');

const PaginatedPost = new Schema({
    hasMore:Boolean,
    posts:[{
        body: String,
        username: String,
        createdAt: String,
        displayname: String,
        image:[String],
        verified: Boolean,
        avatar:String,
        comments: [
          {
            body: String,
            username: String,
            createdAt: String,
            displayname:String,
            avatar:String
          }
        ],
        likes: [
          {
            username: String,
            createdAt: String,
            displayname:String,
            avatar:String
          }
        ],
        user: {
          type: Schema.Types.ObjectId,
          ref: 'users'
        }
    }]
});

module.exports = model('PaginatedPost', PaginatedPost);
