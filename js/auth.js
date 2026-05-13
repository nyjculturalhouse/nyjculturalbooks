document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const btnCheckDup = document.getElementById('btnCheckDup');
    let isIdChecked = false;

    // 1. 로그인 처리
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = document.getElementById('userId').value;
            const password = document.getElementById('password').value;

            try {
                const res = await API.post('login', { 
                    '아이디': userId, 
                    '비밀번호': password 
                });
                
                if (res.success) {
                    const userData = res.data;
                    // 이름 표시를 위한 데이터 보강 (이름이 없으면 아이디라도 사용)
                    userData.name = userData['이름'] || userData['아이디'] || '사용자';
                    
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    UI.showToast(`${userData.name}님 환영합니다!`);
                    
                    setTimeout(() => {
                        window.location.href = userData['권한'] === 'ADMIN' ? 'admin.html' : 'dashboard.html';
                    }, 1000);
                } else {
                    UI.showToast(res.message || '로그인에 실패했습니다.', 'error');
                }
            } catch (err) {
                UI.showToast('서버 연결 오류가 발생했습니다.', 'error');
            }
        });
    }

    // 2. 아이디 중복 체크
    if (btnCheckDup) {
        btnCheckDup.addEventListener('click', async () => {
            const userId = document.getElementById('regUserId').value;
            if (!userId) return UI.showToast('아이디를 입력하세요.', 'error');
            
            try {
                const res = await API.post('checkDuplicateUser', { '아이디': userId });
                if (res.success && !res.data.exists) {
                    UI.showToast('사용 가능한 아이디입니다.');
                    isIdChecked = true;
                    const submitBtn = document.getElementById('btnSubmitSignup');
                    if (submitBtn) submitBtn.disabled = false;
                } else {
                    UI.showToast(res.message || '이미 사용 중인 아이디입니다.', 'error');
                    isIdChecked = false;
                }
            } catch (err) {
                UI.showToast('중복 확인 중 오류가 발생했습니다.', 'error');
            }
        });
    }

    // 3. 회원가입 처리
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!isIdChecked) {
                return UI.showToast('아이디 중복확인을 먼저 해주세요.', 'error');
            }

            const userId = document.getElementById('regUserId').value;
            const password = document.getElementById('regPassword').value;
            const passwordConfirm = document.getElementById('regPasswordConfirm').value;
            const name = document.getElementById('regName').value;

            if (password !== passwordConfirm) {
                return UI.showToast('비밀번호가 일치하지 않습니다.', 'error');
            }

            try {
                const res = await API.post('signup', { 
                    '아이디': userId, 
                    '비밀번호': password, 
                    '이름': name 
                });
                
                if (res.success) {
                    UI.showToast('회원가입 완료! 로그인해주세요.');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    UI.showToast(res.message || '회원가입에 실패했습니다.', 'error');
                }
            } catch (err) {
                UI.showToast('서버 연결 오류가 발생했습니다.', 'error');
            }
        });
    }
});
