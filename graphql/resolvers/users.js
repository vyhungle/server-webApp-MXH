const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');
const cloudinary = require("cloudinary");

const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User.js');
const Post = require('../../models/Post');
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
    { expiresIn: '360d' }
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
    async getUser(_, { username}) {
      try {
        const user = await User.findOne({ username:username });
        if (user) {
          return user;
        }
        else {
          throw new Error("Không tìm thấy người dùng này")
        }
      } catch (error) {
        throw new Error(err)
      }
    },
    async getMyUser(_, {}, context) {
      try {
        const ct=checkAuth(context);
        const user=await User.findOne({username:ct.username});
        if (user) {
          return user;
        }
        else {
          throw new Error("Không tìm thấy người dùng này")
        }
      } catch (error) {
        throw new Error(err)
      }
    },
   
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
    async register(_, { registerInput: { username, email, password, confirmPassword,displayname } }) { 
      const user = await User.findOne({ username });
      const { valid, errors } = validateRegisterInput(displayname,username,email,password,confirmPassword);
      if (user) {    
        const respone=new UserResponse({
          error:{
            field:"username",
            message:"Tên người dùng này đã được sử dụng"
          },
          user:null 
        })
        return respone;
      }
      if (!valid) {
       
        var err=errors.split(",");      
        const respone=new UserResponse({
          error:{
            field:err[1],
            message:err[0]
          },
          user:null
        })
        if(err.length>2){
          for(var i=2;i<err.length-1;i=i+2){
            respone.error.push({
              field:err[i+1],
              message:err[i]
            })
          }
        }
        return respone;
      }
     
      password = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        username,
        password,
        confirmPassword,
        createdAt: new Date().toISOString(),
        displayname
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
    async following(_,{username},context){
      const ct= checkAuth(context);
      const user=await User.findOne({username:ct.username});
      const user2=await User.findOne({username:username});
        try {
          //unfollow
          if(user.following.find((i)=>i.username===user2.username)){ 
            user.following = user.following.filter((i) => i.username !== user2.username);
            user2.follower = user2.follower.filter((i) => i.username !== user.username);
          }
          //follow
          else{
            user.following.push({
              username:user2.username,
              createdAt:new Date().toISOString(),
              displayname:user2.displayname,
              avatar:user2.profile.avatar,
              story:user2.profile.story,
            })
            user2.follower.push({
              username:user.username,
              createdAt:new Date().toISOString(),
              displayname:user.displayname,
              avatar:user.profile.avatar,
              story:user.profile.story,
            })
          }
            await user2.save();
            await user.save();
            return user; 
        } catch (error) {
          throw new Error(error);
        }
    },
    async editProfile(_, {avatar, dateOfBirth, fullName , story, coverImage }, context) {
      try {
        const user = checkAuth(context);
        var uri = "",uriCover="";
        cloudinary.config({
          cloud_name: 'web-img',
          api_key: '539575672138879',
          api_secret: '9ELOxX7cMOVowibJjcVMV9CdN2Y'
        });
          const result = await cloudinary.v2.uploader.upload(avatar, {
            allowed_formats: ["jpg", "png"],
            public_id: "",
            folder: "avatar",
          });
          const result2 = await cloudinary.v2.uploader.upload(coverImage, {
            allowed_formats: ["jpg", "png"],
            public_id: "",
            folder: "CoverImage",
          });
          uri = result.url;
          uriCover=result2.url;
        const me = await User.findOne({ username: user.username });
        if (me) {    
          me.displayname=fullName      
          me.profile.avatar=uri
          me.profile.dateOfBirth=dateOfBirth
          me.profile.fullName=fullName
          me.profile.story=story
          me.profile.coverImage=uriCover
          await me.save()

          const posts = await Post.find()
          for(var i=0;i<posts.length;i++){
            if(posts[i].username===user.username){
              posts[i].displayname=fullName
              posts[i].avatar=uri
            }
            for(var j=0;j<posts[i].comments.length;j++){
              if(posts[i].comments[j].username===user.username){
                posts[i].comments[j].displayname=fullName
                posts[i].comments[j].avatar=uri
              }
            }
            await posts[i].save();
          }
          return me
        }
        else throw new Error("Người dùng này không tồn tại");
      } catch (error) {
        throw new Error(error)
      }
    },
    async findUsers(_,{displayname}){
      try{
        const users=await User.find()
        let values=users.filter(i=>i.displayname.toLowerCase().indexOf(displayname.toLowerCase()) > -1)
        return values;
      }catch(error){
        throw new Error("Username nay khon ton tai")
      }
    }


  }
}
