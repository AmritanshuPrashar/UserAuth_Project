require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { log } = require("console");
const mongoose = require("mongoose");
const app = express();


//For Adding Cookies Packages : 
//npm i passport passport-local passport-local-mongoose express-session

const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

//Encryption Techniques : 

//Using MD5 Hashing to encrypt data
// const md5 = require("md5");

//Using Mongoose-Encrypt
// const encrypt = require("mongoose-encryption");


//Using Bcrypt Encryption : 

// const bcrypt = require("bcrypt");
// const saltRounds = 10;



app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

//For Cookies : 
app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret :String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// Mongoose - Encryption  method : Secret String Instead of Two Keys
// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
 

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {


  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));



//Home Route : 
app.route("/")
  .get((req, res) => {
    res.render("home");
  });



//Login Route : 
app.route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    });
  });


//Register Route : 
app.route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    });
  });



//Secrets Route : 
app.route("/secrets")
  .get((req, res) => {
    // if (req.isAuthenticated()) {
    //   res.render("secrets");
    // } else {
    //   res.redirect("/login");
    // }

    User.find({ "secret": { $ne: null } }, (err,foundUsers) => {
      if (err) {
        console.log(err);
      }
      else {
        if (foundUsers) {
          res.render("secrets", { usersWithSecrets: foundUsers });
        }
      }
    });
  });


//Login Route :  

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


//Auth Route

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });


app.route("/submit")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("submit");
      
    }
    else {
      res.redirect("/login");
    }
  })

  .post((req, res) => {
    const submittedSecret = req.body.secret;
    console.log(req.user._id);

    User.findById(req.user._id, (err, foundUser) => {
      if (err) {
        console.log(err);
      }
      
        if (foundUser) {
          foundUser.secret = submittedSecret;
          foundUser.save(() => {
            res.redirect("/secrets");
          })
        }
      
    })
  })


app.listen(3000, () => {
  console.log("Running on port 3000");
})