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
      const joins = await Join.find();
      return joins.filter((x) => x.groupId === group.id);
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
        const join = await newJoin.save();

        context.pubsub.publish("NEW_JOIN", {
          newJoin: join,
        });
      }
      return ref;
    },

    async acceptJoin(_, { groupId, userId, joinId }) {
      const group = await Group.findById(groupId);
      const user = await User.findById(userId);
      const join = await Join.findById(joinId);
      const ref = isUser(group, user.username);
      if (ref === true) {
        if (user.username === join.member.username) {
          group.members.push(join.member);
          await group.save();
          await join.delete();
        } else ref = false;
      }
      return ref;
    },
    async removeJoin(_, { joinId }) {
      const join = await Join.findById(joinId);
      if (join) {
        await join.delete();
        return true;
      }
      return false;
    },
  },
};
