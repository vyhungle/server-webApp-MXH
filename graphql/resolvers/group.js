const TypeGroup = require("../../models/TypeGroup");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Group = require("../../models/Group");

module.exports = {
  Query: {
    async getTypeGroup(_, {}) {
      const type = await TypeGroup.find();
      console.log(type);
      return type;
    },
    // async getGroups(_, {}) {
    //   const groups = await Group.find();
    //   if (groups) return groups;
    //   else throw new Error("khong tim thay group");
    // },
  },
  Mutation: {
    // async createTypeGroup(_, {}){
    //     const type=await TypeGroup.find();
    //     console.log(type)
    //     return type;
    // }
  },
};
