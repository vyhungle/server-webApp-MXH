const { AuthenticationError, UserInputError } = require("apollo-server");

const Group = require("../../models/Group");
const User = require("../../models/User.js");
const checkAuth = require("../../util/check-auth");
const Invite = require("../../models/Invite");
const { findByIdAndRemove } = require("../../models/Group");

module.exports = {
  Query: {},
  Mutation: {
    async createInvite(_, { groupId, userId }, context) {
      const group = await Group.findById(groupId);
      const ct = checkAuth(context);
      const from = await User.findOne({ username: ct.username });
      const to = await User.findById(userId);

      const newInvite = new Invite({
        groupId: group.id,
        name: group.name,
        imageCover: group.imageCover,
        form:from,
        to:to,
      });
      const invite = await newInvite.save();
      context.pubsub.publish("NEW_INVITE", {
        newInvite: invite,
      });
      
      return invite

    },
  },
};
