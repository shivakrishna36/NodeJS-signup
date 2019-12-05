async function fun(mail,password) {
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
 

  bcrypt.genSalt(saltRounds, function(err, salt) {
    var obj = {};
    bcrypt.hash(mail, salt, function(err, hash) {
      obj.mail = hash;  
      console.log('hash',hash);
    });
    bcrypt.hash(password, salt, function(err, hash) {
      obj.password = hash;
      console.log('hash',hash);
  });
  console.log('obj',obj);
return obj;
});

}
module.exports = fun;