import React, { useState, useEffect, useCallback } from "react";
// React에서 제공하는 기본적인 기능들을 가져와. useState는 상태를 관리하고, useEffect는 컴포넌트가 렌더링될 때 무언가를 할 수 있게 해줘.
// useCallback은 함수를 메모이제이션(필요할 때만 다시 만드는 것)해서 성능을 개선해줘.

import {
  GoogleOAuthProvider, // 구글 OAuth(로그인) 기능을 제공하는 컴포넌트야.
  GoogleLogin, // 구글 로그인 버튼을 제공하는 컴포넌트야.
  googleLogout, // 구글 로그아웃 기능을 제공하는 함수야.
} from "@react-oauth/google";
import LogoutButton from "./components/LogoutButton";
// 우리가 만든 LogoutButton 컴포넌트를 가져와. 이 버튼을 클릭하면 로그아웃이 돼.

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // isLoggedIn이라는 상태를 만들어서, 사용자가 로그인했는지 여부를 저장해.
  const [user, setUser] = useState(null);
  // user라는 상태를 만들어서, 로그인한 사용자의 정보를 저장해.

  // fetchUserInfo 함수를 useCallback으로 메모이제이션
  const fetchUserInfo = useCallback((token) => {
    // 이 함수는 구글 토큰을 받아서 사용자 정보를 가져오는 역할을 해.
    fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        // 만약 오류가 있으면 로그아웃을 처리해.
        if (data.error) {
          console.error("토큰 검증 중 오류:", data.error);
          handleLogout();
        } else {
          setUser(data); // 오류가 없다면 사용자 정보를 저장해.
        }
      })
      .catch((error) => {
        // 데이터를 가져오는 중에 오류가 발생하면 로그아웃해.
        console.error("사용자 정보 가져오기 중 오류:", error);
        handleLogout();
      });
  }, []);

  // checkLoginStatus 함수를 useCallback으로 메모이제이션
  const checkLoginStatus = useCallback(() => {
    // 이 함수는 사용자가 이미 로그인했는지 확인해.
    const storedToken = localStorage.getItem("googleToken");
    // 로컬 스토리지에서 구글 토큰을 가져와.
    if (storedToken) {
      setIsLoggedIn(true);
      // 토큰이 있으면 사용자가 로그인한 상태라고 표시해.
      fetchUserInfo(storedToken);
      // 그리고 토큰을 이용해 사용자 정보를 가져와.
    }
  }, [fetchUserInfo]);

  // 컴포넌트가 처음 화면에 나타날 때 checkLoginStatus 실행
  useEffect(() => {
    checkLoginStatus();
    // 컴포넌트가 처음 화면에 나타날 때 한 번만 로그인 상태를 확인해.
  }, [checkLoginStatus]);

  const responseGoogle = (response) => {
    // 구글 로그인이 성공했을 때 호출되는 함수야.
    console.log("로그인 성공:", response);
    const { credential } = response;
    // 구글에서 받은 로그인 정보를 가져와.
    localStorage.setItem("googleToken", credential);
    // 이 정보를 로컬 스토리지에 저장해.
    setIsLoggedIn(true);
    // 로그인 상태를 true로 바꿔.
    fetchUserInfo(credential);
    // 그리고 사용자 정보를 가져와.

    // 토큰을 백엔드로 전송
    fetch("http://localhost:5000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ token: credential }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("서버 응답:", data);
        // 서버에서 받은 응답을 출력해.
      })
      .catch((error) => {
        console.error("오류:", error);
        // 오류가 발생하면 로그를 출력해.
      });
  };

  const responseGoogleFailure = (error) => {
    // 구글 로그인이 실패했을 때 호출되는 함수야.
    console.error("로그인 실패:", error);
    // 오류 메시지를 출력해.
  };

  const handleLogout = () => {
    // 로그아웃을 처리하는 함수야.
    googleLogout();
    // 구글 로그아웃을 호출해.
    setIsLoggedIn(false);
    // 로그인 상태를 false로 바꿔.
    setUser(null);
    // 사용자 상태를 null로 해.
    localStorage.removeItem("googleToken");
    // 로컬 스토리지에서 구글 토큰을 삭제해.
    console.log("사용자가 로그아웃되었습니다.");

    // 서버에서 로그아웃 호출
    fetch("http://localhost:5000/api/logout", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("성공적으로 로그아웃되었습니다.", data);
        // 서버에서 로그아웃 응답을 받아 출력해.
      })
      .catch((error) => {
        console.error("로그아웃 중 오류:", error);
        // 로그아웃 중 오류가 발생하면 로그를 출력해.
      });
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      {/* 구글 OAuth(로그인) 기능을 사용할 수 있도록 제공하는 컴포넌트야. clientId는 구글에서 받은 앱의 ID야. */}
      <div className="App">
        <header className="App-header">
          <h1>Google login Test</h1>
          {!isLoggedIn ? (
            /* 로그인 상태에 따라 다른 화면을 보여줘. 로그인하지 않은 경우 구글 로그인 버튼을 보여줘. */
            <GoogleLogin
              onSuccess={responseGoogle}
              onError={responseGoogleFailure}
            />
          ) : (
            // 로그인한 경우 로그아웃버튼과 사용자정보를 보여줘.
            <>
              <LogoutButton onLogout={handleLogout} />
              {user && (
                <div>
                  <p>
                    {user.name}님 안녕하세요! FIND US에 오신것을 환영합니다!
                  </p>
                  <p>이메일: {user.email}</p>
                  <p>이름: {user.name}</p>
                </div>
              )}
            </>
          )}
        </header>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
// 이 컴포넌트를 다른 파일에서도 사용할 수 있도록 내보내줘.
