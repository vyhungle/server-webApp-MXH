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
      errors += 'Tên người dùng không được để trống,displayname,';
    }
    else if(displayname.length<5){
      errors += 'Tên người dùng không được nhỏ hơn 5 ký tự,displayname,';
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
  
  module.exports.validateProductInput=( image,price,address,body,category )=>{
    var errors="";
    if(image.length===0){
      errors += 'Vui lòng chọn hình cho sản phẩm,image,'
    }
    if(price.trim()===""){
      errors += 'Giá sản phẩm không được để trống,price,'
    }
    else if(!parseInt(price.trim())){
      errors += 'Giá sản phẩm phải được nhập bằng số,price,'
    }
    else if(parseInt(price.trim())<0){
      errors += 'Giá sản phẩm không được bé hơn 0,price,'
    }
    if(address.trim()===""){
      errors += 'Vui lòng chọn địa chỉ,address,'
    }
    if(body.trim()===""){
      errors +='Nội dung sản phẩm không được để trống,body,'
    }
    if(category.trim()===""){
      errors +='Vui lòng chọn thể loại cho sản phẩm,category,'
    }
    return {
      errors,
      valid: Object.keys(errors).length < 1
    };
    
  }
  

  