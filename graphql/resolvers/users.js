const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User.js');
const checkAuth = require('../../util/check-auth');
const Chat = require('../../models/Chat.js');
const UserResponse = require('../../models/UserResponse');


function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}

module.exports = {
  Query: {
    async getUsers() {
      try {
        const users = await User.find();
        return users;
      }
      catch (err) {
        throw new Error(err);
      }
    },
    async getUser(_, { }, context) {
      try {
        const { username } = checkAuth(context);
        const user = await User.findOne({ username });
        if (user) {
          return user;
        }
        else {
          throw new Error("Không tìm thấy người dùng này")
        }
      } catch (error) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    async login(_, { username, password }) {
    const { errors, valid } = validateLoginInput(username, password);
 
      var field=""
      var message=""
      var err=errors.split(",");
      /* console.log(error) */
      if (!valid) {
        field=err[1]
        message=err[0]
        const respone= new UserResponse({
          error:{
            field:field,
            message:message
          },
          user:null
        })

        if(err.length>2){
          for(var i=2;i<err.length-1;i=i+2){
            field=err[i+1]
            message=err[i]           
            respone.error.push({
              field:field,
              message:message
            })
          }
        }
       
        return respone
        
      }

      const user = await User.findOne({ username });

      if (!user) {

        field="username"
        message="Không tìm thấy người dùng"
        const respone= new UserResponse({
          error:{
            field:field,
            message:message
          },
          user:null
        })
        return respone
        
      }
      else{
        const match = await bcrypt.compare(password, user.password);
          
        if (!match) {
          field="password"
          message="Thông tin đăng nhập sai"
          const respone= new UserResponse({
            error:{
              field:field,
              message:message
            },
            user:null
          })
          return respone
        }
        else{
          const token = generateToken(user);        
          const respone= new UserResponse({
            error:null,
            user:{
                ...user._doc,
                id: user._id,
                token
            }
          })
          return respone
        }
        
      }

    
    },
    async register(_, { registerInput: { username, email, password, confirmPassword } }) {
      //TODO: Validate user data (Xác thực dữ liệu người dùng)
     
      const user = await User.findOne({ username });
      var field=""
      var message=""
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword,
      );
      if (!valid) {
      /*   throw new UserInputError('Errors', { errors });  */
        var err=errors.split(","); 
        field=err[1]
        message=err[0]
        console.log(err)
        const respone=new UserResponse({
          error:{
            field,
            message
          },
          user:null
        })

        if(err.length>2){
          for(var i=2;i<err.length-1;i=i+2){

            field=err[i+1]
            message=err[i]  
            console.log(field+" "+message)
            respone.error.push({
              field:field,
              message:message
            })
          }
        }

        return respone;

        

      }
      if (user) {    
        field="username"
        message="Tên người dùng này đã được sử dụng"
        const respone=new UserResponse({
          error:{
            field,
            message
          },
          user:null
        })
        return respone;
      }
      //TODO: Hash password and create an auth token (mật khẩu băm và tạo mã thông báo xác thực)
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        confirmPassword,
        createdAt: new Date().toISOString()
      });

      const res = await newUser.save();
      const token = generateToken(res);

      const respone=new UserResponse({
        error:null,
        user:{
          ...res._doc,
          id: res._id,
          token
        }
      })
      return respone
    },
    async addFriend(_, { username }, context) {
      try {
        const user = checkAuth(context);
        const me = await User.findOne({ username: user.username });

        const from = await Chat.find({ from: username })
        const to = await Chat.find({ to: username })
        const check = from.concat(to);

        var addChat = 0;
        for (var i = 0; i < check.length; i++) {
          if (check[i].from === username && check[i].to === user.username) {
            addChat = 1;
          }
          else if (check[i].to === username && check[i].from === user.username) {
            addChat = 1;
          }
        }

        if (addChat === 0) {
          const newRoom = new Chat({
            from: user.username,
            to: username,
          });

          const room = await newRoom.save();
        }
        var tam = 0;
        for (var i = 0; i < me.friends.length; i++) {

          if (me.friends[i].username === username) {
            tam = 1;
          }
        }
        /* console.log(tam) */
        if (tam === 1) {
          throw new Error("Bạn đã là bạn của người này rồi")
        }

        me.friends.push({
          username,
          createdAt: new Date().toISOString(),
        })
        await me.save();
        return me;
      } catch (error) {
        throw new Error(error);
      }



    },
    async editProfile(_, {avatar, dateOfBirth, fullName , story,displayname }, context) {
      
      try {
        const user = checkAuth(context);
        const me = await User.findOne({ username: user.username });
        console.log(me.profile);
        if (me) {
          me.profile.avatar=avatar
          me.profile.dateOfBirth=dateOfBirth
          me.profile.fullName=fullName
          me.profile.story=story
          me.profile.follower=me.friends.length
          me.profile.displayname=displayname
          await me.save()
          return me
        }
        else throw new Error("Người dùng này không tồn tại");
      } catch (error) {
        throw new Error(error)
      }
        
     

    }


  }
}
