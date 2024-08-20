const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID, // .env 파일에서 클라이언트 ID를 가져옴
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // .env 파일에서 클라이언트 시크릿을 가져옴
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // .env 파일에서 콜백 URL을 가져옴
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          let user = await User.findOne({ where: { google_id: profile.id } });

          if (!user) {
            user = await User.create({
              google_id: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
