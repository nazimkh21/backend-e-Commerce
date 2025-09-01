const passport = require("passport")
const User = require("../models/User")
require('dotenv').config();

const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async function(req,accessToken, refreshToken, profile, done) {
    try {
      let user = await User.findOne({googleId: profile.id})

   if(!user){
    user = await User.create({
      googleId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value,
      role: "user"
    })
   }
   return done(null,user);
    } catch (error) {
      return done(error,null);
    }
   
  }


));
module.exports = passport