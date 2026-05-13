document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    let isIdChecked = false;

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const 아이디 = document.getElementById('userId').value;
            const 비밀번호 = document.getElementById('password').value;
            
            // 시트 헤더 명칭과 동일한 키값으로 전송
            const res = await API.post('login', { 아이디, 비밀번호 });
            if (res.success) {
                localStorage.setItem('currentUser', JSON.stringify(res.data));
                UI.showToast(res.message);
                setTimeout(() => {
                    window.location.href = res.data.권한 === 'ADMIN' ? 'admin.html' : 'dashboard.html';
                }, 1000);
            } else {
                UI.showToast(res.message, 'error');
            }
        });
    }

    const btnCheckDup = document.getElementById('btnCheckDup');
    if (btnCheckDup) {
        btnCheckDup.addEventListener('click', async () => {
            const 아이디 = document.getElementById('regUserId').value;
            if (!아이디) return UI.showToast('아이디를 입력하세요.', 'error');
            
            const res = await API.post('checkDuplicateUser', { 아이디 });
            if (res.success && !res.data.exists) {
                UI.showToast('사용 가능한 아이디입니다.');
                isIdChecked = true;
                document.getElementById('btnSubmitSignup').disabled = false;
            } else {
                UI.showToast('이미 사용 중인 아이디입니다.', 'error');
                isIdChecked = false;
                document.getElementById('btnSubmitSignup').disabled = true;
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isIdChecked) return UI.showToast('아이디 중복확인을 해주세요.', 'error');
            
            const 아이디 = document.getElementById('regUserId').value;
            const 비밀번호 = document.getElementById('regPassword').value;
            const 이름 = document.getElementById('regName').value;
            const pwConfirm = document.getElementById('regPasswordConfirm').value;

            if (비밀번호 !== pwConfirm) return UI.showToast('비밀번호가 일치하지 않습니다.', 'error');

            const res = await API.post('signup', { 아이디, 비밀번호, 이름 });
            if (res.success) {
                UI.showToast('회원가입 완료! 로그인해주세요.');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                UI.showToast(res.message, 'error');
            }
        });
    }
});
