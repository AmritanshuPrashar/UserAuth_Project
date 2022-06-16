require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { log } = require("console");
const mongoose = require("mongoose");
const app = express();


//Using MD5 Hashing to encrypt data
const md5 = require("md5");
// const encrypt = require("mongoose-encryption");




app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));



mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//Encryption  method : Secret String Instead of Two Keys
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
        let password = md5(req.body.password);
        User.findOne(
            {
                email: username
            },
            (err, foundUser) => {
                if (err) {
                    console.log(err);
                }

                if (foundUser) {
                    if (foundUser.password == password) {
                        res.render("secrets");
                    }
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
        let userPassword = md5(req.body.password);
        const newUser = new User({
            email: userEmail,
            password: userPassword
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



app.listen(3000, () => {
    console.log("Running on port 3000");
})