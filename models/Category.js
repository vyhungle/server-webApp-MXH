const { model, Schema } = require("mongoose");

const categorySchema = new Schema({
    name:String,
    slug:String,
});

module.exports = model("category", categorySchema);