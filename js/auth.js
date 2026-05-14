/**
 * auth.js
 * 로그인 및 회원가입 페이지의 비즈니스 로직을 담당합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // --- 로그인 처리 ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // 중요: 브라우저 기본 제출 동작(새로고침) 방지

            const userId = document.getElementById('userId').value.trim();
            const password = document.getElementById('password').value.trim();
            const loginBtn = loginForm.querySelector('button[type="submit"]');

            if (!userId || !password) {
                UI.showToast("아이디와 비밀번호를 입력해주세요.", "error");
                return;
            }

            try {
                // 버튼 비활성화 (중복 클릭 방지)
                loginBtn.disabled = true;
                UI.showToast("로그인 확인 중...", "info");

                const res = await API.post('login', { userId, password });

                if (res.success) {
                    // 사용자 정보를 로컬 스토리지에 저장
                    localStorage.setItem('currentUser', JSON.stringify(res.data));
                    UI.showToast("로그인 성공! 이동합니다.");
                    
                    // Throttling 에러 방지를 위해 약간의 지연 후 이동하거나 replace 사용
                    setTimeout(() => {
                        window.location.replace('dashboard.html');
                    }, 500);
                } else {
                    UI.showToast(res.message || "로그인 실패: 정보를 확인하세요.", "error");
                    loginBtn.disabled = false;
                }
            } catch (error) {
                console.error("로그인 오류:", error);
                UI.showToast("서버 통신 오류가 발생했습니다.", "error");
                loginBtn.disabled = false;
            }
        });
    }

    // --- 회원가입 처리 ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userId = document.getElementById('userId').value.trim();
            const password = document.getElementById('password').value.trim();
            const name = document.getElementById('userName').value.trim();
            const signupBtn = signupForm.querySelector('button[type="submit"]');

            try {
                signupBtn.disabled = true;
                UI.showToast("가입 처리 중...", "info");

                const res = await API.post('signup', { userId, password, name });

                if (res.success) {
                    alert("회원가입이 완료되었습니다. 로그인해주세요.");
                    window.location.href = 'index.html';
                } else {
                    UI.showToast(res.message || "가입 실패", "error");
                    signupBtn.disabled = false;
                }
            } catch (error) {
                console.error("회원가입 오류:", error);
                UI.showToast("서버 통신 오류 발생", "error");
                signupBtn.disabled = false;
            }
        });
    }
});
