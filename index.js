var express = require("express");
var app = express();

var passport = require("passport");
var bodyParser = require("body-parser");
var localStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var expressSession = require("express-session");

app.use(bodyParser.urlencoded({ extended: false }));

//db setup
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/auth_demo",{ useNewUrlParser: true , useUnifiedTopology: true});
var User = require("./model/user.js");


app.use(expressSession({
    secret: "a quick brown fox jumps over a lawful dog",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//===============
// ROUTES
//===============

//ROOT ROUTE
app.get("/", function(req,res){
    res.render("home.ejs");
});

app.get("/secret", isLoggedIn,  function(req,res){
    res.render("secret.ejs");
});

//AUTH ROUTES

app.get("/register", function(req,res){
    res.render("register.ejs");
});

app.post("/register", function(req,res){
    //get the credentials from the form then register the user.

    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secret");
            });
        }
    });
});

//LOGIN
app.get("/login", function(req,res){
    res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req,res){

});

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function(){
    console.log("running at 3000");
});