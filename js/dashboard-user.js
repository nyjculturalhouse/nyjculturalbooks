document.addEventListener('DOMContentLoaded', () => {
    // 1. 사용자 정보 로드 및 input 채우기
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        if(document.getElementById('infoUserId')) document.getElementById('infoUserId').value = user.아이디 || user.id || '';
        if(document.getElementById('infoName')) document.getElementById('infoName').value = user.이름 || user.name || '';
        if(document.getElementById('infoPhone')) document.getElementById('infoPhone').value = user.전화번호 || user.phone || '';
    }

    // 2. 수정 버튼 이벤트 연결
    const updateBtn = document.getElementById('btnUpdateProfile');
    if (updateBtn) {
        updateBtn.addEventListener('click', updateUserInfo);
    }
});

async function updateUserInfo(e) {
    e.preventDefault();
    const userId = document.getElementById('infoUserId').value;
    const newName = document.getElementById('infoName').value;
    const newPhone = document.getElementById('infoPhone').value;
    const newPassword = document.getElementById('infoPassword').value;
    const passwordConfirm = document.getElementById('profilePasswordConfirm').value;

    if (newPassword && newPassword !== passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    if (confirm("정보를 수정하시겠습니까?")) {
        UI.showToast('처리 중...', 'info');
        const res = await API.post('updateUserInfo', { userId, name: newName, phone: newPhone, password: newPassword });
        
        if (res.success) {
            UI.showToast('정보가 수정되었습니다.');
            const user = JSON.parse(localStorage.getItem('currentUser'));
            user.이름 = newName;
            user.전화번호 = newPhone;
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else { 
            UI.showToast(res.message || '수정 실패', 'error'); 
        }
    }
}

async function withdrawUser() {
    if (confirm("정말로 탈퇴하시겠습니까?")) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const res = await API.post('withdrawUser', { userId: user.userId || user.아이디 });
        if (res.success) {
            alert("회원 탈퇴가 완료되었습니다.");
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        } else { UI.showToast(res.message || "탈퇴 오류", "error"); }
    }
}

async function loadMyRentals(type = 'current') {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(!user) return;
    const res = await API.post('getMyRentals', { userId: user.userId || user.아이디 });
    const tbody = document.getElementById('myRentalsTableBody');
    if (!tbody) return;
    
    if (res.success && res.data.length > 0) {
        // 데이터 출력 로직...
    } else { 
        tbody.innerHTML = `<tr><td colspan="4" class="empty-message">대여 정보가 없습니다.</td></tr>`; 
    }
}
