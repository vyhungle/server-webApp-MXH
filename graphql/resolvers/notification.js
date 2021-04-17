const { AuthenticationError, UserInputError } = require("apollo-server");


const Notification=require("../../models/Notification");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {  
    async getNotification(_, {  },context) {
      try {
        const user=checkAuth(context);
        const notification = await Notification.find({whose:user.username});
        if (notification) {
            var count=0;
            notification.map((n)=>{
                if(n.watched===false) count++;
            })
            const notifications={
                count,
                notifications:notification
            }
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
