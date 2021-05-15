module.exports.CountMembers = (values) => {
  values.map((x) => {
    x.countMembers = x.members.length;
  });
  return values;
};

module.exports.Posts = (value) => {
  value.commentCount = value.comments.length;
  value.likeCount = value.likes.length;
  return value;
};

module.exports.RefGroup = (values) => {
  values.countMembers = values.members.length ;
  return values;
};

module.exports.isUser = (values, username) => {
    let ref=true;
  if (values.leader.username === username) ref=false;
  values.admins.map((a) => {
    if (a.username === username) ref=false;
  });
  values.members.map((m) => {
    if (m.username === username) ref=false;
  });

  return ref;
};
