module.exports.isUser = (Members,username) => {
    var ref=false;
    Members.map((m)=>{
        if(m.username===username) ref=true;
    })

    return ref;
  };
  
  module.exports.isMember = (Members,id) => {
    var ref=false;
    Members.map((m)=>{
        if(m.id===id) ref=true;
    })

    return ref;
  };
  