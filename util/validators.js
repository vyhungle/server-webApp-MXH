module.exports.validateRegisterInput = (
    displayname,
    username,
    email,
    password,
    confirmPassword
  ) => {
    var errors ="";
    if (username.trim() === '') {
      errors += 'Tên người dùng không được để trống,username,';
    }
    if(displayname.trim()===''){
      errors += 'Displayname không được để trống,displayname,';
    }
    if (email.trim() === '') {
      errors += 'Email không được để trống,email,';
    } else {
      const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
      if (!email.match(regEx)) {
        errors += 'Email phải là một địa chỉ email hợp lệ,email,';
      }
    }
    if (password === '') {
      errors += 'Mật khẩu không được để trống,password,';
    } else if (password !== confirmPassword) {
      errors += 'mật khẩu phải trùng khớp,password,';
    }
  
    return {
      errors,
      valid: Object.keys(errors).length < 1
    };
  };

  module.exports.validateLoginInput = (username, password) => {
    var errors ="";
    if (username.trim() === '') {
      errors += 'Tên người dùng không được để trống,username,';
    }
    if (password.trim() === '') {
      errors += 'Mật khẩu không được để trống,password';
    }
  
    return {
      errors,
      valid: Object.keys(errors).length < 1
    };
  };
  
  

  