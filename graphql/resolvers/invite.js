const { AuthenticationError, UserInputError } = require("apollo-server");

const Group = require("../../models/Group");
const User = require("../../models/User.js");
const checkAuth = require("../../util/check-auth");
const Invite = require("../../models/Invite");
const { findByIdAndRemove } = require("../../models/Group");
const { isUser } = require("../../util/function/group");

module.exports = {
  Query: {
    async getMyInvites(_, {}, context) {
      const ct = checkAuth(context);
      const invites = await Invite.find();

      const values = invites.filter((x) => x.to.username === ct.username);
      return values;
    },
  },
  Mutation: {
    async createInvite(_, { groupId, userId }, context) {
      const group = await Group.findById(groupId);
      const ct = checkAuth(context);
      const from = await User.findOne({ username: ct.username });
      const to = await User.findById(userId);
      const ref = isUser(group, to.username);
      if (ref == true) {
        const newInvite = new Invite({
          groupId: group.id,
          name: group.name,
          imageCover: group.imageCover,
          from: { ...from._doc, id: from._id },
          to: { ...to._doc, id: to._id },
        });
        const invite = await newInvite.save();
        context.pubsub.publish("NEW_INVITE", {
          newInvite: invite,
        });
      }
      return ref;
    },
    async acceptInvite(_, { groupId, userId, inviteId }, context) {
      const group = await Group.findById(groupId);
      const user = await User.findById(userId);
      const invite = await Invite.findById(inviteId);

      let ref = false;
      console.log(invite.to.username,user.username)
      if (invite.to.username === user.username) {
        ref = true;
        group.members.map((u) => {
          if (u.username === user.username) {
            ref = false;
          }
        });
      }
      if (ref === true) {
        group.members.push(user);
        await group.save();
        await invite.delete();
      }
      return ref;
    },
    async remoteInvite(_,{inviteId}){
      const invite=await Invite.findById(inviteId);
      if(invite){
        await invite.delete();
        return true;
      }
      return false;
     
    }
  },
};
