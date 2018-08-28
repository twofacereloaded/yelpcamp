var express = require("express");
var router = express.Router();
var passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    bodyParser  = require("body-parser");
var Campground  = require("../models/campground"),
    Comment     = require("../models/comment"),
    User        = require("../models/user"),
    middleware  = require("../middleware");
    
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
//INDEX - show all campgrounds
router.get("/", function(req, res){
    console.log(req.user);
    Campground.find({}, function(err, allCampgrounds){
          if(err){
            console.log(err);
        } else{
            res.render("campgrounds/index", {campgrounds:allCampgrounds});
        }
    });
});

//CREATE - add new campground to database
router.post("/", middleware.isLoggedIn, function (req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.desc;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = { name: name, price: price, image: image, desc:desc, author:author};
    //Create a new campground and save to DB
    Campground.create(newCampground,function(err, newlyCreated) {
        if(err){
            console.log(err);
        } else{
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            console.log(err);
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
    });
});

// EDIT - shows edit form for a campground
router.get("/:id/edit", middleware.isLoggedIn, middleware.checkUserCampground, function(req, res){
  //render edit template with that campground
  res.render("campgrounds/edit", {campground: req.campground});
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id,function(err) {
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;