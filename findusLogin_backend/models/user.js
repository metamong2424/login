const Sequelize = require("sequelize"); // Sequelize 라이브러리를 불러옴. 이 라이브러리를 데이터베이스와 상호작용할 수 있어.

class User extends Sequelize.Model {
  // User라는 이름의 모델 클래스를 정의해. 이 클래스는 Sequelize의 Model 클래스를 상속받아 만들어졌어.
  static initiate(sequelize) {
    // 이 메서드는 User 모델을 초기화(initialize)하는 역할을 해.
    User.init(
      {
        google_id: {
          // 사용자의 구글 ID를 저장하는 필드야.
          type: Sequelize.STRING(40), // 문자열 타입이며, 최대 40까지 저장 가능해.
          allowNull: false, // 이 필드는 반드시 값이 있어야 해.
          unique: true, // 이 값은 유일해야 해, 즉, 동일한 구글 ID를 가진 사용자가 둘 이상 있을 수 없어.
        },
        username: {
          // 사용자의 이름을 저장하는 필드야.
          type: Sequelize.STRING(40), // 문자열 타입이며, 최대 40까지 저장 가능해.
          allowNull: false, // 이 필드도 반드시 값이 있어야 해.
        },
        email: {
          // 사용자의 이메일을 저장하는 필드야.
          type: Sequelize.STRING(40), // 문자열 타입이며, 최대 40까지 저장 가능해.
          allowNull: true, // 이 필드는 필수가 아니기 때문에, 값이 없어도 돼.
          unique: true, // 이 필드 역시 유일해야 해, 동일한 이메일을 가진 사용자가 둘 이상 있을 수 없어.
        },
        // password_hash: {
        //   // 원래 비밀번호 해시 값을 저장하려고 했던 필드야.
        //   type: Sequelize.STRING,
        //   allowNull: true, // 비밀번호가 필수가 아니라면 true로 설정
        // 비밀번호 해시 값은 사용자가 비밀번호로 로그인할 때 필요해.
        // 하지만, 이 경우 구글 로그인만 사용하므로 비밀번호는 필요 없을 수 있어.
        // 그래서 이 필드를 사용하지 않기 위해 주석 처리했어.

        // is_active: {// 사용자의 계정이 활성 상태인지 아닌지를 나타내는 필드야.
        //   type: Sequelize.BOOLEAN,
        //   defaultValue: true, // 기본값으로 true(활성 상태)로 설정해.
        // },
        // is_active 필드는 사용자가 계정을 비활성화하거나 활성화할 수 있는 기능을 구현할 때 사용해.
        // 하지만, 이 프로젝트에서는 그런 기능이 필요 없을 수 있어서 주석 처리한 것 같아.
      },
      {
        sequelize, // 이 모델을 초기화할 때 사용할 sequelize 인스턴스야.
        timestamps: true, // true로 설정하면, 이 모델은 createdAt, updatedAt이라는 두 개의 타임스탬프 필드를 자동으로 추가해.
        underscored: false, // 필드 이름에 언더스코어(_)를 사용하는지 여부를 설정해. 예를 들어, created_at이 아니라 createdAt이 돼.
        modelName: "User", // 이 모델의 이름을 "User"로 설정해.
        tableName: "users", // 이 모델의 연결된 테이블 이름을 "users"로 설정해.
        paranoid: false, // false로 설정하면, 삭제된 데이터가 실제로 데이터베이스에서 삭제돼. true로 설정하면 삭제된 데이터가 숨겨질 뿐, 삭제되지는 않아.
        charset: "utf8", // 데이터의 문자 인코딩을 "utf8"로 설정해. 이 설정은 글자와 같은 다국어를 저장할 때 필요해.
        collate: "utf8_general_ci", // utf8_general_ci는 대소문자를 구분하지 않는 정렬 규칙이야.
      }
    );
  }

  // static associate(db) {
  //   db.User.hasMany(db.Post); // 이 모델이 Post 모델과 1:N 관계를 가진다고 정의해. (한 사용자가 여러 개의 포스트를 가질 수 있음)
  //   db.User.belongsToMany(db.User, {
  //     foreignKey: "followingId",
  //     as: "Followers",
  //     through: "Follow",
  //   });
  //   db.User.belongsToMany(db.User, {
  //     foreignKey: "followerId",
  //     as: "Followings",
  //     through: "Follow",
  //   });
  // }
  // 위의 associate 메서드는 다른 모델들과의 관계를 정의해.
  // 예를 들어, 한 사용자가 여러 개의 포스트를 가질 수 있는 관계를 설정할 때 사용해.
  // 그러나 현재 프로젝트에서는 이런 관계 설정이 필요하지 않거나, 아직 구현되지 않았기 때문에 주석 처리했을 가능성이 있어.
}

module.exports = User; // 이 User 모델을 다른 파일에서 사용할 수 있도록 내보내줌.
