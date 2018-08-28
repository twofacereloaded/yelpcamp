//INCLUDE
var express = require("express");
var router = express.Router({mergeParams: true});
var passport    = require("passport"),
    LocalStrategy = require("passport-local");
var Campground  = require("../models/campground"),
    Comment     = require("../models/comment"),
    User        = require("../models/user"),
    middleware  = require("../middleware");
    
//COMMENTS NEW
router.get("/new", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

//COMMENTS CREATE
router.post("/", middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    console.log("~~~~~~~");
                    console.log(comment);
                    console.log("~~~~~~~");
                    req.flash("success", "Successfully added comment");
                    res.redirect('/campgrounds/' + campground._id);
                }
            }); 
        }
    });
});

//EDIT COMMENT
router.get("/:commentId/edit", middleware.isLoggedIn, middleware.checkUserComment, function(req, res){
  res.render("comments/edit", {campground_id: req.params.id, comment: req.comment});
});

//UPDATE COMMENT
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
       if(err){
           res.redirect("back");
       } else {
           res.redirect("/campgrounds/"+req.params.id);
           console.log(req.body.comment)
       }
   })
});

router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Successfully deleted comment");
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
});

module.exports = router;