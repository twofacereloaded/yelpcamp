var Campground  = require("../models/campground"),
    Comment     = require("../models/comment");
var middlewareObj = {
    checkUserCampground: function(req, res, next){
    Campground.findById(req.params.id, function(err, foundCampground){
      if(err || !foundCampground){
          console.log(err);
          req.flash('error', 'Sorry, that campground does not exist!');
          res.redirect('/campgrounds');
      } else if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
          req.campground = foundCampground;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/campgrounds/' + req.params.id);
      }
    });
  },
  checkUserComment: function(req, res, next){
    Comment.findById(req.params.commentId, function(err, foundComment){
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/campgrounds');
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/campgrounds/' + req.params.id);
       }
    });
  },
  checkCampgroundOwnership: function(req,res,next){
       if(req.isAuthenticated()){
            Campground.findById(req.params.id, function(err, foundCampground){
                if(err){
                    req.flash("error", "Campground not found");
                    res.redirect("back");
                } else {
                    if (!foundCampground) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                    }
                    if(foundCampground.author.id.equals(req.user._id)){
                    next();
                    } else{
                    req.flash("error", "DO NOT HAVE PREMISSIONS");
                    console.log("DO NOT HAVE PREMISSIONS");
                    res.redirect("back");
                    }
                }
            });
        }  else{
            req.flash("error", "Please Login First!");
            res.redirect("back");
        }
    },
    checkCommentOwnership: function(req,res,next){
       if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err){
                    req.flash("error", "Comment not found");
                    res.redirect("back");
                } else {
                    if (!foundComment) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                    }
                    if(foundComment.author.id.equals(req.user._id)){
                    next();
                    } else{
                    req.flash("error", "DO NOT HAVE PREMISSIONS");
                    res.redirect("back");
                    }
                }
            });
        }  else{
            res.redirect("back");
        }
    },
    isLoggedIn: function(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/login");
    }
};
module.exports = middlewareObj;