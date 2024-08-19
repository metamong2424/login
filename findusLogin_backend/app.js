const express = require("express"); // Express는 웹 서버를 쉽게 만들 수 있게 해주는 프레임워크야.
const passport = require("./config/passport"); // Passport 설정을 가져와서 사용자 인증에 사용할 수 있게 해.
const { OAuth2Client } = require("google-auth-library"); // 구글 OAuth2 클라이언트를 가져와서 사용할 준비를 해.
const User = require("./models/user"); // User 모델을 가져와서 데이터베이스와 상호작용할 수 있게 해.
const session = require("express-session"); // 세션 관리를 위한 라이브러리. 로그인한 사용자 정보를 유지할 때 사용해.
const { sequelize } = require("./models"); // Sequelize를 통해 데이터베이스와 연결할 수 있게 해.
const cors = require("cors"); // 다른 도메인에서 요청이 들어오는 걸 허용하는 CORS 설정을 쉽게 도와주는 라이브러리야.
const auth = require("./routes/auth"); // 인증과 관련된 라우트를 불러와.

const app = express(); // Express 애플리케이션을 생성해.

sequelize
  .sync({ force: false }) // 데이터베이스와 모델을 동기화해. { force: false }는 기존 데이터가 삭제되지 않게 해.
  .then(() => {
    console.log("데이터베이스 연결 성공"); // 데이터베이스 연결이 성공하면 메시지를 출력해.
  })
  .catch((err) => {
    console.error(err); // 연결이 실패하면 에러 메시지를 출력해.
  });

// Google OAuth 클라이언트 설정
const client = new OAuth2Client(
  "409726963182-dvfkoejiiqk5u475o2pnsln8inujfokp.apps.googleusercontent.com"
); // 구글 클라이언트를 설정해. 클라이언트 ID는 환경 변수에서 가져와.

// CORS 설정
app.use(
  cors({
    origin: "http://localhost:3000", // React 앱의 주소를 허용해. 다른 도메인에서 요청을 받아들일 수 있게 해.
    credentials: true, // 인증 정보(쿠키 등)를 포함한 요청을 허용해.
  })
);

// 미들웨어 설정
app.use(express.json()); // JSON 형식의 요청을 처리할 수 있게 해줘.
app.use(
  session({
    secret: "findusSessionSecret", // 세션 암호화에 사용할 비밀 키를 설정해.
    resave: false, // 세션이 변경되지 않은 경우에도 다시 저장할지 여부를 설정해. false로 설정하면 효율적이야.
    saveUninitialized: false, // 초기화되지 않은 세션을 저장할지 여부를 설정해. false로 설정하면 불필요한 세션 저장을 막을 수 있어.
  })
);
app.use(passport.initialize()); // Passport 초기화. 인증 처리를 위해 꼭 필요해.
app.use(passport.session()); // Passport가 세션을 관리할 수 있도록 설정해.

// Google 토큰 검증 함수
async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token, // 구글에서 받은 토큰을 검증해.
    audience:
      "409726963182-dvfkoejiiqk5u475o2pnsln8inujfokp.apps.googleusercontent.com", // 이 토큰이 이 앱을 위한 것인지 확인해.
  });
  return ticket.getPayload(); // 토큰에서 사용자 정보를 추출해 반환해.
}

app.use("/auth", auth); // "/auth" 경로로 들어오는 요청은 모두 auth 라우트에서 처리하도록 설정해.

// 주석 처리된 라우트 설정 부분은 아래와 같아:
// app.get(
//   "/auth/google",
//   (req, res, next) => {
//     console.log("Google Auth Request");
//     next();
//   },
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   (req, res, next) => {
//     console.log("Query:", req.query);
//     console.log("Body:", req.body);
//     next();
//   },
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     // 성공적인 인증, 홈 페이지로 리다이렉션.
//     res.redirect("http://localhost:3000"); // React 앱의 주소로 리다이렉트
//   }
// );
// 주석처리된 부분은
// 따라서

// 홈 페이지 설정
app.get("/", (req, res) => {
  res.send("Hello, this is the home page!"); // 홈 페이지에 접속하면 간단한 인사 메시지를 보여줘.
});

// 사용자 정보 엔드포인트
app.get("/api/user", (req, res) => {
  if (req.user) {
    res.json(req.user); // 사용자가 로그인한 상태라면, 사용자 정보를 JSON으로 반환해.
  } else {
    res.status(401).json({ error: "Not authenticated" }); // 로그인하지 않은 상태라면, 인증 오류 메시지를 반환해.
  }
});

// 로그아웃 엔드포인트
app.get("/api/logout", (req, res) => {
  req.logout((err) => {
    // Passport에서 제공하는 로그아웃 함수를 사용해 로그아웃해.
    if (err) {
      return res.status(500).json({ error: "Error during logout" }); // 로그아웃 중 오류가 발생하면 에러 메시지를 반환해.
    }
    res.json({ message: "Logged out successfully" }); // 성공적으로 로그아웃하면 메시지를 반환해.
  });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack); // 에러 스택을 콘솔에 출력해.
  res.status(500).send("Something broke!"); // 에러가 발생하면 500 상태 코드와 함께 메시지를 반환해.
});

// 서버 시작
const PORT = process.env.PORT || 5000; // 서버가 실행될 포트를 설정해. 기본적으로 5000번 포트를 사용해.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // 서버가 실행되면 콘솔에 메시지를 출력해.
});

module.exports = app; // 이 애플리케이션을 다른 파일에서도 사용할 수 있도록 내보내줘.
