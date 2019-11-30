const LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
var pry = require('pry')
const secret = require('./secretkeys')

module.exports = function(passport) {

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({email: email})
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
    );


  passport.use(new FacebookStrategy({
    clientID: secret.fb.clientID,
    clientSecret: secret.fb.clientSecret,
    callbackURL: secret.fb.callbackURL,
    profileFields: ['id', 'displayName', 'link', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({facebook_id: profile.id}, function(err, oldUser){
      if(oldUser){
        done(null,oldUser);
      }else{
        var newUser = new User({
          facebook_id : profile.id,
          email : profile.emails[0].value,
          name : profile.displayName,
          password : "fb123456"
        }).save(function(err,newUser){
          if(err) throw err;
          done(null, newUser);
        });
      }
    });
  }
  ));

  passport.use(new GoogleStrategy({
   clientID: secret.google.clientID,
    clientSecret: secret.google.clientSecret,
    callbackURL: secret.google.callbackURL,
   passReqToCallback   : true
 },
  function(request, accessToken, refreshToken, profile, done) {
  User.findOne({google_id: profile.id}, function(err, oldUser){
    if(oldUser){
      done(null,oldUser);
    }else{
      var newUser = new User({
        google_id : profile.id,
        email : profile.email,
        name : profile.displayName,
        password : "google123456"
      }).save(function(err,newUser){
        if(err) throw err;
        done(null, newUser);
      });
    }
  });
}
));


  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
