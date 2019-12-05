const app = require('express')();
const bodyparser = require('body-parser');
var cookies = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const strategy = require('passport-local');
//var values = require('./config/encryption.js')
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cookies());
app.use(session({
                  secret:'hi',
                  resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 10000
        }
      }));
var mongoose = require('mongoose');
const url = "mongodb://localhost:27017/studb";
const bcrypt = require('bcrypt');
const saltRounds = 10;


var courseData = require('../signup/params/courses.json')



mongoose.connect(url, { useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "err"));
db.once("open", function (callback) {
  console.log("connection succeeded.");
});



var Schema = mongoose.Schema;
var userSchema = new Schema({
  firstName: String,
  lastName: String,
  mobileNumber: Number,
  mailId: String,
  password: String
});



var courseSchema = new Schema({
  SerialNumber: Number,
  courseName: String,
  targetAudience: String,
  location: String,
  duration: Number,
  startDate: String,
  endDate: String,
  startTime: String,
  endTime: String
})




var details, sessionCreate;
var signup = mongoose.model('userDetails', userSchema);
var courses = mongoose.model('courseDetails', courseSchema);
courses.find({}, function (err, data) {
  if (data == '') {
    courses.insertMany(courseData.data, function (err, data) {
      if (err)
        console.log("courses data not inserted");
      else
        console.log("courses Data inserted");
    })
  }
})





app.get('/', (req, res) => {
 //sessionCreate = req.session.destroy();
  res.sendFile('index.html',
    {
      root: path.join(__dirname, './public')
    });
});





app.get('/signup', (req, res) => {
  res.sendFile('signup.html',
    {
      root: path.join(__dirname, './public')
    });
});

app.post('/signup', (req, res) => {
  var obj = req.body;
  bcrypt.hash(obj.password, saltRounds, function (err, hash) {
    var object = {
      firstName: obj.firstName,
      lastName: obj.lastName,
      mobileNumber: obj.mobileNumber,
      mailId: obj.mailId,
      password: hash
    }
    console.log('object', object);
    details = new signup(object);
    details.save(function (err) {

      if (err)
        console.log('err')
      else
        console.log('data inserted')
    })
    console.log('hash', hash);
  });
  res.redirect('http://localhost:4848/')
});




app.get('/login', (req, res) => {
  // if(sessionCreate){
  //   res.redirect('http://localhost:4848/homePage')
  // }
  res.sendFile('login.html',
    {
      root: path.join(__dirname, './public')
    });
});





app.post('/login', (req, res) => {
  if (!req.body.mailId || !req.body.password) {
    res.redirect('http://localhost:4848/login');
        
  }else{
  
  
  console.log("inside /signin", req.body.mailId);
  signup.findOne({ mailId: req.body.mailId }, function (err, user) {
    if (err) throw err;
    bcrypt.compare(req.body.password, user.password, function (err, data) {
      if (err) {
        console.log('error', err);
      }
      else {
        if (data) {
          console.log('matched');
          sessionCreate = req.session;
          sessionCreate.data = {
            mail: req.body.mailId
          }
          console.log("session created..");
          res.redirect('http://localhost:4848/homePage');
         
         
        }
        else {
          console.log("password mismatch..");
        }
      }
    });
  });
}
})





app.set('view engine', 'ejs');


app.get('/homePage', (req, res) => {
  console.log("homePage");
  sessionCreate = req.session;
  if(!sessionCreate.data || !req.body)
  {
    res.redirect('http://localhost:4848/login')
  }
  //else{
  // res.sendFile('homePage.ejs',
  //   {
  //     root: path.join(__dirname, './views')
  //   });
  // }
  else{
  courses.find({}, function (err, data) {
    if (err)
      console.log("data not retrieved");
    else
      console.log("data retrived");
    res.render('homePage', { data });
  })
}
});

app.get('/logout', (req, res) => {
  sessionCreate = req.session;
  sessionCreate.destroy(function(err){
    if(err)
    throw err;
    console.log('session destroyed');
    res.redirect('http://localhost:4848/homePage')
  })
 res.sendFile('index.html',
   {
     root: path.join(__dirname, './public')
   });
});


app.listen(4848, function () {
  console.log("Running on port 4848....");
})
