const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
  friends: [{
    username: String,
    createdAt: String,
  }],
  
});

module.exports = model('User', userSchema);
