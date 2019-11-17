const LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
var pry = require('pry')

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

  clientID =  '414580605876166',
  clientSecret =  '7a6501f9f6cf7bc969804f49b22351c1',
  callbackURL =  "http://localhost:3000/users/auth/facebook/callback"

  passport.use(new FacebookStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: callbackURL,
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
   clientID: '1001495843695-9q2fi1dhu8i48t7tmjehc0ljhkmucrd1.apps.googleusercontent.com',
   clientSecret: 'uLtbIa6z8aupODjGVvfk9Ewz',
   callbackURL: "http://localhost:3000/users/auth/google/callback",
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
