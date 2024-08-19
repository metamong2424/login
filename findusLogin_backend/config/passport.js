const passport = require("passport"); // Passport 라이브러리를 불러옴. 사용자의 인증(로그인)을 쉽게 처리해주는 도구야.
const User = require("../models/user"); // User 모델을 불러와서 데이터베이스와 상호작용할 수 있게 해줘.
const googleStrategy = require("./googleStrategy"); // 구글 로그인을 처리하는 전략을 불러옴.

module.exports = () => {
  // 이 파일을 다른 곳에서 사용할 수 있도록 함수 형태로 내보내줌.

  // 사용자가 로그인할 때, 사용자 정보를 세션에 저장할 때 호출됨.
  passport.serializeUser((user, done) => {
    console.log("serialize");
    done(null, user.id); // 사용자의 고유 ID를 세션에 저장해. 나중에 이 ID로 사용자를 찾을 수 있어.
  });

  // 세션에 저장된 사용자 ID를 이용해, 로그인한 사용자의 정보를 복원할 때 호출됨.
  passport.deserializeUser((id, done) => {
    User.findById(id) // 데이터베이스에서 사용자의 ID를 이용해 사용자를 찾음.
      .then((user) => done(null, user)) // 사용자를 찾으면 그 정보를 done 함수로 넘겨줘.
      .catch((err) => done(err)); // 오류가 발생하면 에러를 처리해.
  });

  // 구글 로그인 전략을 Passport에 추가해서 사용할 수 있게 설정함.
  googleStrategy(passport);
};

module.exports = passport; // Passport 설정을 다른 파일에서도 사용할 수 있게 내보내줌.
