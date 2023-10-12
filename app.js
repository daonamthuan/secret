//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//const secret = "Thisisourlittlesecret.";      => Move to .env
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {
    res.render("secrets");
})

app.post("/register", async (req, res) => {
    try {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });
        newUser.save();
        res.redirect("/secrets");
    } catch (err) {
        console.log(err);
    }   
})

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        // When "findOne", this automatically decryption password
       const foundUser = await User.findOne({email: username});
       if (foundUser) {
        if (foundUser.password === password) {
            res.redirect("/secrets");
        }
       }
    } catch (err) {
        console.log(err);
    }
})



app.listen(3000, function(){
    console.log("Server started on port 3000.");
} )