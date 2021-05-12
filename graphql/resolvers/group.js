const TypeGroup=require('../../models/TypeGroup')
const User=require('../../models/User');
const Post=require('../../models/Post');




module.exports={
    Query:{
        async getTypeGroup(_, {}){
            const type=await TypeGroup.find();
            console.log(type)
            return type;
        }
    },
    Mutation:{
        // async createTypeGroup(_, {}){
        //     const type=await TypeGroup.find();
        //     console.log(type)
        //     return type;
        // }
    }
    
};