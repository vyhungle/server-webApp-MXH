const { model, Schema } = require('mongoose');

const PaginatedPost = new Schema({
    hasMore:Boolean,
    posts:[{
        body: String,
        username: String,
        createdAt: String,
        displayname: String,
        image: String,
        verified: Boolean,
        comments: [
          {
            body: String,
            username: String,
            createdAt: String
          }
        ],
        likes: [
          {
            username: String,
            createdAt: String
          }
        ],
        user: {
          type: Schema.Types.ObjectId,
          ref: 'users'
        }
    }]
});

module.exports = model('PaginatedPost', PaginatedPost);
