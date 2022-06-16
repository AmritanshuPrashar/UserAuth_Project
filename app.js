require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { log } = require("console");
const mongoose = require("mongoose");
const app = express();


//Encryption Techniques : 

//Using MD5 Hashing to encrypt data
// const md5 = require("md5");

//Using Mongoose-Encrypt
// const encrypt = require("mongoose-encryption");


//Using Bcrypt Encryption : 

const bcrypt = require("bcrypt");
const saltRounds = 10;



app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));



mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Mongoose - Encryption  method : Secret String Instead of Two Keys
// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);







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
        let username = req.body.username;
        let password = req.body.password;
        User.findOne(
            {
                email: username
            },
            (err, foundUser) => {
                if (err) {
                    console.log(err);
                }

                if (foundUser) {
                    bcrypt.compare(password, foundUser.password, function(err2, result) {
                        if (result == true) {
                            res.render("secrets"); 
                        }
                        else {
                            console.log(err2);
                        }
    
                    }); 
                        
                    
                }

            }
        );
    });


//Register Route : 
app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        let userEmail = req.body.username;
        let userPassword = req.body.password;
        bcrypt.hash(userPassword, saltRounds, function(err, hashPassword) {
            const newUser = new User({
                email: userEmail,
                password: hashPassword
            });
            newUser.save((err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("secrets");
                }
            });
        });



    });



app.listen(3000, () => {
    console.log("Running on port 3000");
})