document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    let isIdChecked = false;

    if (loginForm) {
    // 회원가입 폼 제출 이벤트
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isIdChecked) return UI.showToast('아이디 중복확인을 해주세요.', 'error');
            
            const userId = document.getElementById('regUserId').value;
            const password = document.getElementById('regPassword').value;
            const passwordConfirm = document.getElementById('regPasswordConfirm').value;
            const name = document.getElementById('regName').value;

            if (password !== passwordConfirm) return UI.showToast('비밀번호가 일치하지 않습니다.', 'error');

            // 전송 데이터 키를 시트 헤더와 동일하게 '아이디', '비밀번호', '이름'으로 설정
            const res = await API.post('signup', { 
                '아이디': userId, 
                '비밀번호': password, 
                '이름': name 
            });
            
            if (res.success) {
                UI.showToast('회원가입 완료! 로그인해주세요.');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                UI.showToast(res.message, 'error');
            }
        });
    }
            
            if (res.success) {
                const userData = res.data;
                // 이름 표시를 위한 데이터 정리
                const finalName = userData['이름'] || userData['아이디'] || '사용자';
                userData.name = finalName; // 호환성을 위해 name 속성 추가
                
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                UI.showToast(`${finalName}님 환영합니다!`);
                setTimeout(() => {
                    window.location.href = userData['권한'] === 'ADMIN' ? 'admin.html' : 'dashboard.html';
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
