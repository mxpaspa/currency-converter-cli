var loginUserName = "";
var loginPassword = "";
var mongoose = require('mongoose');
var uri = 'mongodb://paspam:convertercli12@ds117422.mlab.com:17422/converter-cli';

// define a timeout (required for mlab)
var options = {
      "keepAlive" : 300000,
      "connectTimeoutMS" : 30000,
      useNewUrlParser: true
}

function findUser(User,loginUserName,loginPassword, cb) {
    User.findOne({username : loginUserName}).then(function(record,isMatch){
      record.comparePassword(loginPassword,function(err,isMatch){
        if (err) throw err;
        cb(isMatch);
    });
  });
}


function connectDb(cb) {
  var mongoose = require('mongoose');
  var uri = 'mongodb://paspam:convertercli12@ds117422.mlab.com:17422/converter-cli';

  // define a timeout (required for mlab)
  var options = {
        "keepAlive" : 300000,
        "connectTimeoutMS" : 30000,
        useNewUrlParser: true
  }
  mongoose.connect(uri, options);
  var db = mongoose.connection;
  cb(db);
}



function createUser(User,un,pw,cb){

  var newUser = new User({
      username: un,
      password: pw,
  });
  newUser.save(function() {
    User.find().findOne({username : newUser.username}).then(function(record,err){

          if (err) throw err;
          cb(record);

      });
    });
};





module.exports  =  {
  findUser,
  connectDb,
  createUser,
  loginUserName,
  loginPassword,
}
