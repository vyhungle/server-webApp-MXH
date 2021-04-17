const { model, Schema } = require('mongoose');

const notificationSchema = new Schema({
    type:String,
    title:String,
    createdAt:String,
    displayname:String,
    username:String,
    avatar:String,
    whose:String,
    watched:Boolean,
});

module.exports = model('Notification', notificationSchema);
