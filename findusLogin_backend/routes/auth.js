const express = require("express"); // Express는 Node.js에서 웹 서버를 쉽게 만들 수 있게 해주는 프레임워크야.
const passport = require("passport"); // Passport는 사용자의 인증(로그인)을 도와주는 라이브러리야.
const { OAuth2Client } = require("google-auth-library"); // 구글 OAuth2를 사용하기 위한 라이브러리에서 클라이언트를 불러와.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // 구글 클라이언트를 설정해. 클라이언트 ID는 환경 변수에서 가져와.
const User = require("../models/user"); // User 모델을 가져와서 데이터베이스와 상호작용할 수 있게 해줘.
const router = express.Router(); // Express에서 라우터를 생성해. 이걸로 URL별로 다르게 동작하게 할 수 있어.

// 구글 로그인 페이지로 리디렉션
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // 구글에서 사용자의 프로필과 이메일 정보를 요청할 거야.
  })
);

// 구글에서 인증이 완료된 후 리디렉션될 콜백 URL 처리
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }), // 인증 실패 시 홈 페이지로 리디렉션.
  (req, res) => {
    console.log("test request");
    // 인증 성공 시 메인 페이지로 리디렉션
    res.redirect("/");
    console.log("A");
  }
);

// 구글에서 받은 토큰을 처리
router.post("/google", async (req, res) => {
  console.log(req.body);
  const { token } = req.body; // 요청에서 구글 토큰을 가져와.
  console.log(token);
  if (!token) {
    return res.status(400).json({ error: "Token is missing" }); // 토큰이 없으면 오류 메시지를 반환해.
  }

  try {
    console.log("1");
    const ticket = await client.verifyIdToken({
      idToken: token, // 구글에서 받은 토큰을 검증해.
      audience: process.env.GOOGLE_CLIENT_ID, // 이 토큰이 이 앱을 위한 것인지 확인해.
    });
    console.log("2");
    const { sub, name, email } = ticket.getPayload(); // 토큰에서 사용자 정보(고유 ID, 이름, 이메일)를 추출해.
    console.log("3");
    console.log(sub, name, email);

    // 사용자 정보를 데이터베이스에 저장하는 로직
    let user = await User.findOne({ where: { google_id: sub } }); // 데이터베이스에서 이 구글 ID를 가진 사용자가 이미 있는지 확인해.
    console.log("4");
    console.log(user);
    if (!user) {
      user = await User.create({
        google_id: sub, // 새로운 사용자를 데이터베이스에 저장해.
        username: name,
        email: email,
      });
    }
    res.status(200).json({ sub, name, email }); // 사용자 정보를 반환해.
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Invalid token" }); // 오류가 발생하면 오류 메시지를 반환해.
  }
});

// 로그아웃 처리
router.get("/logout", (req, res) => {
  req.logout((err) => {
    // Passport에서 제공하는 로그아웃 함수로 사용자를 로그아웃해.
    if (err) {
      return next(err); // 에러가 발생하면 에러를 처리해.
    }
    // 세션 쿠키를 명확히 삭제
    res.clearCookie("connect.sid", { path: "/" }); // 사용자의 세션을 관리하는 쿠키를 삭제해.

    // 로그아웃 후 로컬 스토리지에 저장된 토큰 삭제를 프론트엔드에서 처리하도록 스크립트 추가
    res.send(`
      <script>
        localStorage.removeItem('googleToken'); // 브라우저의 로컬 스토리지에서 구글 토큰을 삭제해.
        window.location.href = "/"; // 홈 페이지로 이동해.
      </script>
    `);
  });
});

module.exports = router; // 이 라우터를 다른 파일에서 사용할 수 있게 내보내줘.
