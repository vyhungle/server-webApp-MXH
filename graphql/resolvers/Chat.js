const { AuthenticationError, UserInputError } = require('apollo-server');
const { formatError } = require('graphql');

const Chat = require('../../models/Chat.js');
const User = require('../../models/User.js');
const checkAuth = require('../../util/check-auth');

module.exports = {
    Query: {
        async getChats() {
            try {
                const chats = await Chat.find();
                return chats;
            }
            catch (err) {
                throw new Error(err);
            }
        },
        async getChat(_, { roomId },context) {
            try {
                const chat= await Chat.findById(roomId);
                if (chat) {
                    chat.content.reverse();
                    return chat;
                }
                else throw new Error("Phong nay khong ton tai")

            }
            catch (err) {
                throw new Error(err);
            }
        },
        async getRoomChat(_, {  },context) {
            let values=[]
            
            const user=checkAuth(context)
            var username=user.username
            try {
               const chat=await Chat.find();
               chat.forEach(element => {
                    if(element.members[0].username===username || element.members[1].username===username){
                        element.content.reverse()
                        values.push(element);
                    }                   
                    
                });        
               
                return  values;
            }
            catch (err) {
                throw new Error(err);
            }
        },

    },
    Mutation: {
        async createRoomChat(_, { userId }, context) {
            const user = checkAuth(context);
            const to= await User.findById(userId);
         
            const from= await User.findOne({username:user.username})
            const chat= await Chat.find();
            var dk=1;
            try {
                chat.forEach(element => {                 
                  if((element.members[0].username===to.username && element.members[1].username===from.username) ||   
                    (element.members[0].username===from.username && element.members[1].username===to.username)){
                        dk=0;
                    }
                });
                if(dk==1 && to && from){
                    const members=[];members.push(to);members.push(from);
                    const room=new Chat({
                        members                
                    })
                    room.save();     
                    return room; 
                }
                else throw new Error("Bạn đã là bạn của người này rồi");
                         
              
            } catch (error) {
                throw new Error(error)
                
                
            }


        },
        async createContentChat(_, { roomId, content }, context) {
            const { username } = checkAuth(context);
            const user=await User.findOne({username:username})
            if (content.trim() === '') {
                throw new Error('Nội dung chat không được để trống');
            }
            const chat = await Chat.findById(roomId)
           

            if (chat) {
                chat.content.push({
                    username,
                    createdAt: new Date().toISOString(),
                    content,
                    displayname:user.displayname,
                })
                await chat.save(); 
                return chat;
            }
            else {
                throw new Error('Không tìm thấy id phòng')
            }
        }
    },


};
