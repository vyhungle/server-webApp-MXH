module.exports.isUser = (Members,username) => {
    var ref=false;
    Members.map((m)=>{
        if(m.username===username) ref=true;
    })

    return ref;
  };
  