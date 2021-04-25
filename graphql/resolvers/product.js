const { AuthenticationError, UserInputError } = require("apollo-server");
const { validateProductInput } = require("../../util/validators");
const Post = require("../../models/Post");
const Product = require("../../models/Product");
const checkAuth = require("../../util/check-auth");
const cloudinary = require("cloudinary");
const User = require("../../models/User.js");

module.exports = {
  Query: {
    async getProducts(_,{}){
      const products=await Product.find();
      if(products){
        products.reverse();
        return products;
      }
      throw new Error("khong co product");
    },
    async getProduct(_,{productId}){
        const product=await Product.findById(productId);
        if(product){
          return product;
        }
        throw new Error("San phan nay khong ton tai")
    },
    async getMyProducts(_,{},context){
      const ct=checkAuth(context);
      const product=await Product.find();
      const values= product.filter(x=>x.seller.username===ct.username)
      if(values){
        return values;
      }
      throw new Error("Ban khong co san pham")
    },
    async getIncreasedProducts(_,{}){
      const product=await Product.find().sort({'price':1});   
      if(product){
        return product;
      }
      throw new Error("Ban khong co san pham")
    },
    async getDecreasedProducts(_,{}){
      const product=await Product.find().sort({'price':-1});   
      if(product){
        return product;
      }
      throw new Error("Ban khong co san pham")
    },
    async FilterProducts(_,{category,address}){
      const product=await Product.find()
     
      if(category==="ALL" && address!=="ALL"){
        values=product.filter(x=>x.address===address)
      }
      else if(category!=="ALL" && address==="ALL"){
        values=product.filter(x=>x.category===category)
      }
      else if(address==="ALL" && category==="ALL"){
        values=product;
      }
      else{
        values=product.filter(x=>x.category===category && x.address===address)
      } 
      if(values){
        return values;
      }
      throw new Error("Ban khong co san pham")
    },
    async FilterProductsByCategory(_,{category}){
      const product=await Product.find()
      const values=product.filter(x=>x.category===category)
      if(values){
        return values;
      }
      throw new Error("Ban khong co san pham")
    },
    async FilterProductsByAddress(_,{address}){
      const product=await Product.find()
      const values=product.filter(x=>x.address===address)
      if(values){
        return values;
      }
      throw new Error("Ban khong co san pham")
    },
  },
  Mutation: {
    async createProduct(_, { image, price, address, body, category,describe }, context) {
      const { errors, valid } = validateProductInput(
        image,
        price,
        address,
        body,
        category,      
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
          image:uri,
          category,
          describe,
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
    async deleteProduct(_,{productId}){
        const product=await Product.findById(productId)
        if(product){
          await product.delete();
          return "Xoa thanh cong"
        }
        else{
          throw new Error("Khong tim thay san pham nay")
        }    
        
    }
  },
};
