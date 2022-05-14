require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const grid = require("gridfs-stream");
const methodOverride = require("method-override");
const nodemailer = require("nodemailer");
const sendSms = require('../config/notification');
const fs = require("fs");
const User = require("../models/User");
const { forwardAuthenticated, ensureAuthenticated } = require("../config/auth");



// LOGIN ROUTE
router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login");
});

// REGISTER ROUTE
router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("register");
});

// REGISTERING A USER
router.post(
  "/register",
  async (req, res, next) => {
    const {
      firstName,
      lastName,
      email,
      username,
      phnumber,
      country,
      password,
      confirmPassword,
      gender,
      age,
    } = req.body;
    console.log(req.body)
    let errors = [];

    if (
      !firstName ||
      !lastName ||
      !email ||
      !username ||
      !password ||
      !confirmPassword ||
      !phnumber ||
      !country ||
      !gender ||
      !age
    ) {
      errors.push({ msg: "Please enter all fields" });
    }
    
    if (password != confirmPassword) {
      errors.push({ msg: "Passwords do not match" });
    }

    if (phnumber.length !== 10) {
      errors.push({ msg: "Please Enter a Valid Phone Number !" });
    }

    if (password.length <= 8) {
      errors.push({ msg: "Password must be at least 8 characters" });
    }

    if (errors.length > 0) {
      res.render("register", {
        errors,
        firstName,
        username,
        lastName,
        email,
        age,
        phnumber,
        country,
        password,
        confirmPassword,
        gender,
        profileAvatar,
      });
    } else {
      User.findOne({ username: username }).then((user) => {
        if (user) {
          errors.push({ msg: "Username already in use" });
          res.render("register", {
            errors,
            firstName,
            lastName,
            username,
            email,
            country,
            age,
            phnumber,
            gender,
            password,
            confirmPassword,
          });
        } else {
          const newUser = new User({
            firstName,
            lastName,
            email,
            age,
            username,
            phnumber,
            country,
            gender,
            password,
          });
          async function hashing() {
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(password, salt);
            newUser
              .save()
              .then((user) => {
                const transporter = nodemailer.createTransport({
                  port: 465,
                  host: "smtp.gmail.com",
                  auth: {
                    user: "samparktech.inc@gmail.com",
                    pass: "373ftnn5123",
                  },
                  secure: true,
                });

                const mailData = {
                  from: "samparktech.inc@gmail.com",
                  to: `${user.email}`,
                  subject: "Welcome to Sampark",
                  html: `<h1>Hello ${user.firstName},</h1><br><h2>Welcome to Sampark</h2><br>Here you can Share Post on latest going Affairs and have a nice Chat with the Awesome community we have of our Users! `,
                };
                const mailDataForAdmin = {
                  from: "samparktech.inc@gmail.com",
                  to: `samparktech.inc@gmail.com`,
                  subject: "New User!",
                  html: `  
                      <!DOCTYPE html>
<html>
<head>
<style>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

h2{font-family: arial, sans-serif;}
td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>
</head>
<body>

<h2>New User on Sampark</h2>

<table>
  <tr>
    <th>Fields</th>
    <th>Entry</th>
  </tr>
  <tr>
    <td>Name</td>
    <td>${user.firstName} ${user.lastName}</td>
  </tr>
  <tr>
    <td>Email</td>
    <td>${user.email}</td>
  </tr>
  <tr>
    <td>Username</td>
    <td>${user.username}</td>
  </tr>
  <tr>
    <td>Phone Number</td>
    <td>${user.phnumber}</td>
  </tr>
  <tr>
    <td>Gender</td>
    <td>${user.gender}</td>
  </tr>
  <tr>
    <td>Country</td>
    <td>${user.country}</td>
  </tr>
</table>

</body>
</html>     
                      `,
                };

                transporter.sendMail(mailData, function (err, info) {
                  if (err) console.log(err);
                  else res.redirect("/verify");
                });
                transporter.sendMail(mailDataForAdmin, function (err, info) {
                  if (err) console.log(err);
                });
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          }

          hashing();
        }
      });
    }
  }
);

// LOGIN ROUTE
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// LOGOUT ROUTE
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

// UPDATE USER PROFILE REQUEST
router.post("/updateprofile", (req, res) => {
  const { firstName, lastName, gender, age, phnumber, country } = req.body;
  User.updateMany({
    firstName: firstName,
    lastName: lastName,
    age: age,
    phnumber: phnumber,
    country: country,
    gender: gender,
  })
    .then((user) => {
      req.flash("success_msg", "User updated succesfully");
      res.redirect("/profile");
    })
    .catch((err) => console.log(err));
});

router.get("/:username", ensureAuthenticated, (req, res) => {
  const userID = req.params.username;
  User.findOne({ username: userID }).then((user) => {
    if (user) {
      res.render("user", { user });
    } else {
      res.render("usernotfound");
    }
  });
});

router.get("/chat/:userid", ensureAuthenticated, (req, res) => {
  const userID = req.params.userid;
  User.findOne({ username: userID }).then((user) => {
    if (user) {
      res.render("dm", { userID, user });
    } else {
      res.render("usernotfound");
    }
  });
});

router.post(
  "/follow/:toFollow/:followingBy/:followerPhnumber",
  ensureAuthenticated,
  (req, res) => {
    const toFollow = req.params.toFollow;
    const followingBy = req.params.followingBy;
    const phnumber = req.params.followerPhnumber;
    const followingObj = {
      following: toFollow,
    };
    const followerObj = {
      follower: followingBy,
    };
    User.findOneAndUpdate(
      { username: followingBy },
      { $push: { followingArray: followingObj } },
      (err, done) => {
        if (done) {
          res.redirect("/people");
          notifyMsg = `${followingBy} started following you on Sampark! Check it out`
          sendSms(phnumber, notifyMsg);
        } else {
          console.log(err);
        }
      }
    );
    User.findOneAndUpdate(
      { username: toFollow },
      { $push: { followerArray: { followers: followingBy } } },
      (err, done) => {
        if (!done) {
          console.log(err);
        }
      }
    );
  }
);

router.post(
  "/unfollow/:toUnFollow/:unfollowedBy",
  ensureAuthenticated,
  (req, res) => {
    const toUnFollow = req.params.toUnFollow;
    const unfollowedBy = req.params.unfollowedBy;
    User.updateOne(
      { username: unfollowedBy },
      { $pull: { followingArray: { following: toUnFollow } } },
      (err, done) => {
        if (done) res.redirect("/people");
        else console.log(err);
      }
    );
    User.updateOne(
      { username: toUnFollow },
      { $pull: { followerArray: { followers: unfollowedBy } } },
      (err, done) => {
        if (!done) console.log(err);
      }
    );
  }
);
router.get("/followers/:userID", (req, res) => {
  const userID = req.params.userID;
  User.findOne({ username: userID }, (err, User) => {
    if (!User) console.log(err);
    else res.render("followers", { User, user: req.user });
  });
});

router.post('/post/save/:userId/:postId', ensureAuthenticated, (req, res) => {
    const userID = req.params.userId;
    const postID = req.params.postId;
    User.updateOne({username : userID}, { $push: { savedPosts: { postID: postID } } }, (err, done) =>{})
});
router.post('/post/like/:userId/:postId', ensureAuthenticated, (req, res) => {
  const userID = req.params.userId;
  const postID = req.params.postId;
  User.updateOne({username : userID}, { $push: { likedPosts: { likedPostId: postID } } }, (err, done) =>{})
});

module.exports = router;
