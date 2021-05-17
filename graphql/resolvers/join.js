const { AuthenticationError, UserInputError } = require("apollo-server");

const Group = require("../../models/Group");
const User = require("../../models/User.js");
const checkAuth = require("../../util/check-auth");
const Join = require("../../models/Join");
const { findByIdAndRemove } = require("../../models/Group");
const { isUser } = require("../../util/function/group");

module.exports = {
  Query: {
    async getJoinInGroup(_, { groupId }) {
      const group = await Group.findById(groupId);
      const joins = group.joins;
      return joins;
    },
  },
  Mutation: {
    async createJoin(_, { groupId }, context) {
      const ct = checkAuth(context);
      const user = await User.findOne({ username: ct.username });
      const group = await Group.findById(groupId);
      const ref = isUser(group, user.username);
      if (ref === true) {
        const newJoin = new Join({
          groupId: group.id,
          name: group.name,
          imageCover: group.imageCover,
          member: { ...user._doc, id: user._id },
        });
       group.joins.push(newJoin);
       await group.save();
      }
      return ref;
    },

    async acceptJoin(_, { groupId, userId, joinId }) {
      const group = await Group.findById(groupId);
      const user = await User.findById(userId);
      const join = group.joins.find(x=>x.id===joinId);
      console.log(join.member.username)
      const ref = isUser(group, user.username);
      if (ref === true) {
        if (user.username === join.member.username) {
          join.member.id=userId
          group.members.push(join.member);
          const index=group.joins.findIndex(x=>x.id===joinId);
          group.joins.splice(index,1);
          await group.save();
        } else ref = false;
      }
      return ref;
    },
    async removeJoin(_, { groupId,joinId }) {
      const group=await Group.findById(groupId);
      if (group) {
        const index=group.joins.findIndex(x=>x.id===joinId);
        group.joins.splice(index,1);
        await group.save();
        return true;
      }
      return false;
    },
  },
};
