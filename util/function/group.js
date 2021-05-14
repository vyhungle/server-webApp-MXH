module.exports.CountMembers=(values)=>{
    values.map((x)=>{
        x.countMembers=x.members.length+1+x.admins.length;
    })
    return values;
}

module.exports.Posts=(values)=>{
    values.map((x)=>{
        x.commentCount=x.comments.length
        x.likeCount=x.likes.length
    })
    return values;
}