const { model, Schema } = require("mongoose");

const typeGroupSchema = new Schema({
    name:String,
    slug:String,
});

module.exports = model("typeGroup", typeGroupSchema);