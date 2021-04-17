const { AuthenticationError, UserInputError } = require("apollo-server");


const Notification=require("../../models/Notification");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {  
    async getNotification(_, {  },context) {
      try {
        const user=checkAuth(context);
        const notifications = await Notification.find({whose:user.username});
        console.log(notifications)
        if (notifications) {
          return notifications;
        } else {
          throw new Error("Không tìm thất thông báo nào");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
 
};
