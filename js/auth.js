document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const btnCheckDup = document.getElementById('btnCheckDup');
    const regUserIdInput = document.getElementById('regUserId');
    
    // 중복 확인 상태 관리 변수
    let isIdChecked = false;
    let checkedId = "";

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = document.getElementById('userId').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!userId || !password) {
                return UI.showToast('아이디와 비밀번호를 입력해주세요.', 'error');
            }

            try {
                // API 호출 (데이터 키값을 서버와 일치시킴)
                const res = await API.post('login', { 
                    '아이디': userId, 
                    '비밀번호': password 
                });
                
                if (res.success) {
                    const userData = res.data;
                    // 이름 데이터 보정
                    userData.name = userData['이름'] || userData['아이디'] || '사용자';
                    
                    // 로컬 스토리지에 사용자 정보 저장
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    UI.showToast(`${userData.name}님 환영합니다!`);
                    
                    // 권한에 따른 페이지 이동
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

    // 중복 확인 후 아이디를 수정하면 다시 확인하도록 감시
    if (regUserIdInput) {
        regUserIdInput.addEventListener('input', () => {
            if (isIdChecked && regUserIdInput.value !== checkedId) {
                isIdChecked = false;
                const submitBtn = document.getElementById('btnSubmitSignup');
                if (submitBtn) submitBtn.disabled = true; // 가입 버튼 비활성화
                console.log("아이디 수정됨: 중복 확인 초기화");
            }
        });
    }

    if (btnCheckDup) {
        btnCheckDup.addEventListener('click', async () => {
            const userId = regUserIdInput.value.trim();
            if (!userId) return UI.showToast('아이디를 입력하세요.', 'error');
            
            try {
                const res = await API.post('checkDuplicateUser', { '아이디': userId });
                if (res.success && !res.data.exists) {
                    UI.showToast('사용 가능한 아이디입니다.');
                    isIdChecked = true;
                    checkedId = userId; // 확인 완료된 아이디 저장
                    
                    const submitBtn = document.getElementById('btnSubmitSignup');
                    if (submitBtn) submitBtn.disabled = false; // 가입 버튼 활성화
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
            
            // 1. 중복 확인 체크
            if (!isIdChecked || regUserIdInput.value !== checkedId) {
                return UI.showToast('아이디 중복확인을 먼저 완료해주세요.', 'error');
            }

            const userId = regUserIdInput.value.trim();
            const password = document.getElementById('regPassword').value;
            const passwordConfirm = document.getElementById('regPasswordConfirm').value;
            const name = document.getElementById('regName').value.trim();

            // 2. 필수 입력값 체크
            if (!userId || !password) {
                return UI.showToast('아이디와 비밀번호를 입력해주세요.', 'error');
            }

            // 3. 비밀번호 일치 확인
            if (password !== passwordConfirm) {
                return UI.showToast('비밀번호가 일치하지 않습니다.', 'error');
            }

            try {
                const res = await API.post('signup', { 
                    '아이디': userId, 
                    '비밀번호': password, 
                    '이름': name || userId // 이름이 없으면 아이디로 대체
                });
                
                if (res.success) {
                    UI.showToast('회원가입 완료! 로그인 페이지로 이동합니다.');
                    setTimeout(() => window.location.href = 'index.html', 1500);
                } else {
                    UI.showToast(res.message || '회원가입에 실패했습니다.', 'error');
                }
            } catch (err) {
                UI.showToast('서버 연결 오류가 발생했습니다.', 'error');
            }
        });
    }
});
