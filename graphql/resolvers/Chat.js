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
                
                const user=checkAuth(context)
                var chat;
                if(roomId===""){
                   const values =await Chat.find();
                   const chats=values.filter(t=>t.to.username===user.username || t.from.username===user.username)
                   if(chats[0].from.username===user.username){
                       var tam=chats[0].to;
                       chats[0].to=chats[0].form;
                       chats[0].form=tam;
                   }
                   
                   chat=chats[0];
                  
                }
                else chat= await Chat.findById(roomId);
                if (chat) {
                
                    if(chat.from.username===user.username){                 
                      chat.from=chat.to                  
                    }
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
                    if(element.from.username===username || element.to.username===username){
                        values.push(element);
                    }
                });
               values.forEach(element => {
                   if(element.to.username==username){              
                       let tam=element.to;
                       element.to=element.from;
                       element.from= tam;            
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
                    if((element.to.username===to.username && element.from.username===from.username) 
                    || (element.to.username===from.username && element.from.username===to.username)){
                        dk=0;
                    }
                });
                if(dk==1){
                    const room=new Chat({
                        from,
                        to,                 
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
