module.exports.CountMembers=(values)=>{
    values.map((x)=>{
        x.countMembers=x.members.length+1+x.admins.length;
    })
    return values;
}

module.exports.Posts=(value)=>{
        value.commentCount=value.comments.length
        value.likeCount=value.likes.length
    return value;
}

module.exports.RefGroup=(values)=>{ 
        values.countMembers=values.members.length+1+values.admins.length;
    return values;
}