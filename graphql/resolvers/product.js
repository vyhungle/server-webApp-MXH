const { AuthenticationError, UserInputError } = require("apollo-server");
const { validateProductInput } = require("../../util/validators");
const Post = require("../../models/Post");
const Product = require("../../models/Product");
const checkAuth = require("../../util/check-auth");
const cloudinary = require("cloudinary");
const User = require("../../models/User.js");
const Category = require("../../models/Category");
const Location = require("../../models/Location");

module.exports = {
  Query: {
    async getProducts(_, {}) {
      const products = await Product.find();
      if (products) {
        products.reverse();
        return products;
      }
      throw new Error("khong co product");
    },
    async getCategories(_, {}) {
      const categories = await Category.find();
      if (categories) {
        categories;
        return categories;
      }
      throw new Error("khong co product");
    },
    async getLocations(_, {}) {
      const locations = await Location.find();
      if (locations) {
        locations;
        return locations;
      }
      throw new Error("khong co product");
    },
    async getProduct(_, { productId }) {
      const product = await Product.findById(productId);
      if (product) {
        return product;
      }
      throw new Error("San phan nay khong ton tai");
    },
    async getMyProducts(_, {}, context) {
      const ct = checkAuth(context);
      const product = await Product.find();
      const values= product.filter((p) => p.seller.username === ct.username);
      if (values) {
        return values;
      }
      throw new Error("San phan nay khong ton tai");
    },
    async getProducts(_, { category, address, sort }) {
      product = await Product.find();
      sort === 1
        ? product.sort(function (a, b) {
            return a.price - b.price;
          })
        : sort === undefined || sort === 0
        ? (product = await Product.find())
        : product.sort(function (a, b) {
            return b.price - a.price;
          });
      if (
        (address === undefined || address === "") &&
        (category === undefined || category === "")
      ) {
        values = product;
      } else if (
        (category !== undefined || category !== "") &&
        (address === undefined || address === "")
      ) {
        values = product.filter((x) => x.category.slug === category);
      } else if (
        (category === undefined || category === "") &&
        (address !== undefined || address !== "")
      ) {
        values = product.filter((x) => x.address.zipcode === address);
      } else {
        values = product.filter(
          (x) => x.category.slug === category && x.address.zipcode === address
        );
      }
      if (values) {
        return values;
      }
      throw new Error("Ban khong co san pham");
    },
  },
  Mutation: {
    async createProduct(
      _,
      { image, price, address, body, category, describe },
      context
    ) {
      const { errors, valid } = validateProductInput(
        image,
        price,
        address,
        body,
        category
      );
      var field = "",
        message = "";
      var err = errors.split(",");
      const ProductResponse = { error: [], product: null };
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
        var uri = [];
        for (var i = 0; i < image.length; i++) {
          if (image[i]) {
            cloudinary.config({
              cloud_name: "web-img",
              api_key: "539575672138879",
              api_secret: "9ELOxX7cMOVowibJjcVMV9CdN2Y",
            });
            const result = await cloudinary.v2.uploader.upload(image[i], {
              allowed_formats: ["jpg", "png"],
              public_id: "",
              folder: "product",
            });
            uri.push(result.url);
          }
        }
        const user = checkAuth(context);
        const categoties = await Category.findOne({ name: category });
        const location = await Location.findOne({ location: address });
        const seller = await User.findOne({ username: user.username });
        const newProduct = new Product({
          price,
          body,
          address: location,
          createdAt: new Date().toISOString(),
          image: uri,
          category: categoties,
          describe,
          seller,
        });
        const product = await newProduct.save();
        context.pubsub.publish("NEW_PRODUCT", {
          newProduct: product,
        });
        ProductResponse.product = product;
      }
      return ProductResponse;
    },
    async deleteProduct(_, { productId }) {
      const product = await Product.findById(productId);
      if (product) {
        await product.delete();
        return "Xoa thanh cong";
      } else {
        throw new Error("Khong tim thay san pham nay");
      }
    },
  },
};
