document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const btnCheckDup = document.getElementById('btnCheckDup');
    let isIdChecked = false;

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

            // 데이터가 비어있는지 클라이언트에서 먼저 확인
            if (!userId || !password) {
                return UI.showToast('아이디와 비밀번호를 입력해주세요.', 'error');
            }

            if (password !== passwordConfirm) {
                return UI.showToast('비밀번호가 일치하지 않습니다.', 'error');
            }

            console.log("서버로 보내는 데이터:", { '아이디': userId, '비밀번호': password, '이름': name });

            try {
                const res = await API.post('signup', { 
                    '아이디': userId, 
                    '비밀번호': password, 
                    '이름': name 
                });
                
                if (res.success) {
                    UI.showToast('회원가입 완료! 로그인해주세요.');
                    setTimeout(() => window.location.href = 'index.html', 1500);
                } else {
                    UI.showToast(res.message || '회원가입에 실패했습니다.', 'error');
                }
            } catch (err) {
                UI.showToast('서버 연결 오류가 발생했습니다.', 'error');
            }
        });
    }
