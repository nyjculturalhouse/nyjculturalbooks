/**
 * auth.js
 * 로그인 및 회원가입 페이지의 비즈니스 로직을 담당합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // HTML의 실제 ID인 'btnCheckDup'으로 참조를 수정합니다.
    const checkDuplicateBtn = document.getElementById('btnCheckDup'); 

    // --- 아이디 중복 확인 처리 ---
    if (checkDuplicateBtn) {
        checkDuplicateBtn.addEventListener('click', async () => {
            // 회원가입 페이지의 아이디 입력창 ID는 'regUserId'입니다.
            const userIdElement = document.getElementById('regUserId');
            const userId = userIdElement ? userIdElement.value.trim() : "";

            if (!userId) {
                UI.showToast("아이디를 입력해주세요.", "error");
                return;
            }

            try {
                UI.showToast("중복 확인 중...", "info");
                // 서버 키값에 맞춰 '아이디' 사용
                const res = await API.post('checkDuplicate', { 아이디: userId });

                if (res.success) {
                    UI.showToast(res.message || "사용 가능한 아이디입니다.", "success");
                    // 중복 확인 완료 상태 저장
                    checkDuplicateBtn.dataset.checked = "true";
                    
                    // [수정] 중복 확인 성공 시 비활성화된 회원가입 버튼을 활성화
                    const signupBtn = document.getElementById('btnSubmitSignup');
                    if (signupBtn) {
                        signupBtn.disabled = false;
                    }
                } else {
                    UI.showToast(res.message || "이미 사용 중인 아이디입니다.", "error");
                    checkDuplicateBtn.dataset.checked = "false";
                }
            } catch (error) {
                console.error("중복 확인 오류:", error);
                UI.showToast("서버 통신 오류가 발생했습니다.", "error");
            }
        });

        // [추가] 만약 중복확인 후 아이디를 다시 수정하면 버튼을 다시 비활성화 (보안)
        const regUserIdInput = document.getElementById('regUserId');
        if (regUserIdInput) {
            regUserIdInput.addEventListener('input', () => {
                checkDuplicateBtn.dataset.checked = "false";
                const signupBtn = document.getElementById('btnSubmitSignup');
                if (signupBtn) signupBtn.disabled = true;
            });
        }
    }

    // --- 로그인 처리 ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // 브라우저 기본 제출 동작 방지

            const userId = document.getElementById('userId').value.trim();
            const password = document.getElementById('password').value.trim();
            const loginBtn = loginForm.querySelector('button[type="submit"]');

            if (!userId || !password) {
                UI.showToast("아이디와 비밀번호를 입력해주세요.", "error");
                return;
            }

            try {
                loginBtn.disabled = true;
                UI.showToast("로그인 확인 중...", "info");

                const res = await API.post('login', { 아이디: userId, 비밀번호: password });

                if (res.success) {
                    localStorage.setItem('currentUser', JSON.stringify(res.data));
                    UI.showToast("로그인 성공! 이동합니다.");
                    
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

            const userId = document.getElementById('regUserId').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const passwordConfirm = document.getElementById('regPasswordConfirm').value.trim();
            const name = document.getElementById('regName').value.trim();
            const phone = document.getElementById('regPhone').value.trim();

            const signupBtn = document.getElementById('btnSubmitSignup');

            // 비밀번호 확인 체크
            if (password !== passwordConfirm) {
                UI.showToast("비밀번호가 일치하지 않습니다.", "error");
                return;
            }

            // 중복 확인 여부 체크
            if (checkDuplicateBtn && checkDuplicateBtn.dataset.checked !== "true") {
                UI.showToast("아이디 중복 확인을 해주세요.", "error");
                return;
            }

            try {
                signupBtn.disabled = true;
                UI.showToast("가입 처리 중...", "info");

                const res = await API.post('signup', {
                    아이디: userId,
                    비밀번호: password,
                    이름: name,
                    전화번호: phone
                });

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
