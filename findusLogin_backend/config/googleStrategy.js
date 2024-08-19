const passport = require("passport"); // Passport는 사용자의 인증(로그인)을 도와주는 라이브러리야.
// GoogleStrategy는 구글 로그인을 구현하기 위해 필요한 전략을 제공하는 라이브러리야.
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user"); // User 모델을 불러와서 데이터베이스와 상호작용할 수 있게 해줘.

module.exports = () => {
  // 이 파일을 다른 곳에서 사용할 수 있도록 함수 형태로 내보내줌.
  passport.use(
    // Passport에 구글 로그인 전략을 사용하겠다고 설정함.
    new GoogleStrategy(
      {
        clientID:
          "409726963182-dvfkoejiiqk5u475o2pnsln8inujfokp.apps.googleusercontent.com", // 구글 API를 사용하기 위한 클라이언트 ID. .env 파일에서 가져옴.
        clientSecret: "findusSessionSecret", // 구글 API의 비밀키. .env 파일에서 가져옴.
        callbackURL: "http://localhost:5000/auth/google/callback", // 구글 로그인 후 사용자를 돌려보낼 URL.
      },
      async function (accessToken, refreshToken, profile, done) {
        // 사용자가 구글 로그인을 시도하면 실행되는 함수야.
        // 데이터베이스에서 사용자의 구글 ID로 검색해, 이미 등록된 사용자인지 확인해.
        try {
          let user = await User.findOne({ where: { google_id: profile.id } });

          if (!user) {
            // 사용자가 데이터베이스에 없으면 새로 만들어서 등록해.
            user = await User.create({
              google_id: profile.id, // 구글 ID를 저장해.
              username: profile.displayName, // 사용자의 구글 프로필 이름을 저장해.
              email: profile.emails[0].value, // 사용자의 이메일을 저장해.
            });
          }
          return done(null, user); // 사용자 정보를 넘겨줘서 로그인 처리를 완료해.
        } catch (error) {
          return done(error); // 오류가 발생하면 에러를 처리해.
        }
      }
    )
  );
};
