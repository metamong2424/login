const Sequelize = require("sequelize"); // Sequelize는 데이터베이스와 상호작용하기 위한 라이브러리야.
const fs = require("fs"); // 파일 시스템과 상호작용하기 위한 Node.js의 기본 모듈이야.
const path = require("path"); // 파일 및 디렉터리 경로를 다루기 위한 Node.js의 기본 모듈이야.
// 현재 환경을 설정해. 기본적으로 'development'(개발 환경)로 설정되어 있어.
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env]; // 환경에 맞는 데이터베이스 설정 정보를 불러와.

const db = {}; // 데이터베이스와 모델들을 저장할 객체를 생성해.
const sequelize = new Sequelize(
  config.database, // 데이터베이스 이름
  config.username, // 데이터베이스 사용자 이름
  config.password, // 데이터베이스 비밀번호
  config // 기타 설정 정보들
);

db.sequelize = sequelize; // 이 sequelize 객체를 db에 저장해서 다른 곳에서도 사용할 수 있게 해.

const basename = path.basename(__filename); // 현재 파일의 이름을 가져와.
fs.readdirSync(__dirname) // 현재 디렉토리(폴더)의 모든 파일을 읽어들여.
  .filter((file) => {
    // 특정 조건을 만족하는 파일들만 남겨.
    // 조건 1: 파일 이름이 '.'로 시작하지 않아야 함 (숨김 파일 필터링).
    // 조건 2: 현재 파일(index.js)은 제외.
    // 조건 3: 파일 확장자가 '.js'인 파일만 포함.
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    // 필터링된 각 파일에 대해 실행함.
    const model = require(path.join(__dirname, file)); // 해당 파일을 불러와서 모델로 사용해.
    db[model.name] = model; // 모델을 db 객체에 저장해.
    model.initiate(sequelize); // 모델을 초기화(initiate)해 데이터베이스와 연결해.
  });

Object.keys(db).forEach((modelName) => {
  // db 객체에 있는 모든 모델에 대해 실행함.
  if (db[modelName].associate) {
    db[modelName].associate(db); // 모델에 연결된 다른 모델들과의 관계를 설정해줘.
  }
});

module.exports = db; // 이 db 객체를 다른 파일에서도 사용할 수 있게 내보내줘.
