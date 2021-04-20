const { AuthenticationError, UserInputError } = require("apollo-server");
const { validateProductInput } = require("../../util/validators");
const Post = require("../../models/Post");
const Product = require("../../models/Product");
const checkAuth = require("../../util/check-auth");
const cloudinary = require("cloudinary");
const User = require("../../models/User.js");
const { validate } = require("../../models/Post");
module.exports = {
  Query: {
    async getProducts(_,{}){
      const products=await Product.find();
      if(products){
        return products;
      }
      throw new Error("khong co product");
    }
  },
  Mutation: {
    async createProduct(_, { image, price, address, body, category }, context) {
      const { errors, valid } = validateProductInput(
        image,
        price,
        address,
        body,
        category
      );
      var field = "";
      var message = "";
      var err = errors.split(",");
      const ProductResponse = {
        error: [],
        product: null,
      };
      if (!valid) {
        for (var i = 0; i < err.length - 1; i = i + 2) {
          field = err[i + 1];
          message = err[i];
          ProductResponse.error.push({
            field: field,
            message: message,
          });
        }
      } else {
        var uri = "";
        if (image) {
          cloudinary.config({
            cloud_name: "web-img",
            api_key: "539575672138879",
            api_secret: "9ELOxX7cMOVowibJjcVMV9CdN2Y",
          });
          const result = await cloudinary.v2.uploader.upload(image, {
            allowed_formats: ["jpg", "png"],
            public_id: "",
            folder: "product",
          });
          uri = result.url;
        }
        const user = checkAuth(context);
        const seller = await User.findOne({ username: user.username });
        const newProduct = new Product({
          price,
          body,
          address,
          createdAt: new Date().toISOString(),
          image,
          category,
          seller,     
        });
        const product = await newProduct.save();
        context.pubsub.publish("NEW_PRODUCT", {
          newProduct: product,
        });
        ProductResponse.product=product;
      }
      return ProductResponse;
    },
  },
};
