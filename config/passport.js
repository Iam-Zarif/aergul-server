// // config/passport.js
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/user");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Find user by email or create a new user
//         let user = await User.findOne({ email: profile.emails[0].value });

//         if (!user) {
//           user = new User({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             photo: profile.photos[0].value,
//             accessToken,
//             refreshToken,
//           });
//           await user.save();
//         } else {
//           // Update accessToken and refreshToken if the user exists
//           user.accessToken = accessToken;
//           user.refreshToken = refreshToken;
//           await user.save();
//         }

//         return done(null, user);
//       } catch (error) {
//         done(error, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });