import React from "react"; // React 라이브러리를 불러와서 리액트 컴포넌트를 만들 수 있게 해줘.

const LogoutButton = ({ onLogout }) => {
  // 로그아웃 버튼을 만드는 컴포넌트야. 이 컴포넌트는 onLogout이라는 함수를 받아와.
  return <button onClick={onLogout}>로그아웃</button>; // 버튼을 클릭하면 onLogout 함수가 실행돼. 버튼에 '로그아웃'이라는 텍스트가 보여.
};

export default LogoutButton; // 이 컴포넌트를 다른 파일에서 사용할 수 있도록 내보내줘.
