const { model, Schema } = require("mongoose");
const User=require('./User');
const Post=require('./Post');
const TypeGroup=require('./TypeGroup')

const groupSchema = new Schema({
    leader:User,
    admins:[User],
    members:[User],
    typeGroup:TypeGroup,
    name:String,
    imageCover:String,
    countMembers:String,
    public:Boolean,
    describe:String,
    posts:[Post],
});

module.exports = model("group", groupSchema);