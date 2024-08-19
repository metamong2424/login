// Sequelize라는 ORM(객체 관계 매핑) 라이브러리를 불러옴. 이걸로 MySQL 같은 데이터베이스를 다룰 수 있어.
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv"); // dotenv는 .env 파일에 있는 환경 변수를 쉽게 사용할 수 있게 해주는 라이브러리야.

dotenv.config(); // .env 파일에 있는 환경 변수를 불러와서 코드에서 사용할 수 있도록 설정해줘.
console.log(GOOGLE_CLIENT_ID);

const sequelize = new Sequelize(
  process.env.DB_NAME, // 데이터베이스 이름을 환경 변수(DB_NAME)에서 가져옴.
  process.env.DB_USER, // 데이터베이스 사용자 이름을 환경 변수(DB_USER)에서 가져옴.
  process.env.DB_PASS, // 데이터베이스 비밀번호를 환경 변수(DB_PASS)에서 가져옴.
  {
    host: process.env.DB_HOST, // 데이터베이스가 위치한 호스트 주소를 환경 변수(DB_HOST)에서 가져옴.
    dialect: process.env.DB_DIALECT, // 사용할 데이터베이스의 종류(MySQL 등)를 환경 변수(DB_DIALECT)에서 가져옴.
  }
);

// 이 sequelize 객체를 다른 파일에서 사용할 수 있도록 내보내줌. 이걸로 데이터베이스와 연결하고 데이터를 다룰 수 있어.
module.exports = sequelize;
