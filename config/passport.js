const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// LOAD USER MODEL
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
          // Match user
          User.findOne({
            username: username
          }).then(user => {
            if (!user) {
              return done(null, false, { message: 'User not found' });
            }
    
            // Match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: 'Incorrect Password' });
              }
            });
          });
        })
      );
    
      passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
    
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
};
