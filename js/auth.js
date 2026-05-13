document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    let isIdChecked = false;

    // 로그인
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = document.getElementById('userId').value;
            const password = document.getElementById('password').value;
            
            const res = await API.post('login', { userId, password });
            if (res.success) {
                localStorage.setItem('currentUser', JSON.stringify(res.data));
                UI.showToast(res.message);
                window.location.href = res.data.role === 'ADMIN' ? 'admin.html' : 'dashboard.html';
            } else {
                UI.showToast(res.message, 'error');
            }
        });
    }

    // 아이디 중복 확인
    const btnCheckDup = document.getElementById('btnCheckDup');
    if (btnCheckDup) {
        btnCheckDup.addEventListener('click', async () => {
            const userId = document.getElementById('regUserId').value;
            if (!userId) return UI.showToast('아이디를 입력하세요.', 'error');
            
            const res = await API.post('checkDuplicateUser', { userId });
            if (res.success && !res.data.exists) {
                UI.showToast('사용 가능한 아이디입니다.');
                isIdChecked = true;
                document.getElementById('btnSubmitSignup').disabled = false;
            } else {
                UI.showToast(res.message, 'error');
                isIdChecked = false;
                document.getElementById('btnSubmitSignup').disabled = true;
            }
        });
    }

    // 회원가입
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isIdChecked) return UI.showToast('아이디 중복확인을 해주세요.', 'error');
            
            const userId = document.getElementById('regUserId').value;
            const password = document.getElementById('regPassword').value;
            const passwordConfirm = document.getElementById('regPasswordConfirm').value;
            const name = document.getElementById('regName').value;

            if (password !== passwordConfirm) return UI.showToast('비밀번호가 일치하지 않습니다.', 'error');

            const res = await API.post('signup', { userId, password, name });
            if (res.success) {
                UI.showToast('회원가입 완료! 로그인해주세요.');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                UI.showToast(res.message, 'error');
            }
        });
    }
});
