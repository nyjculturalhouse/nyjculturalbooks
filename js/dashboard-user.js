async function updateUserInfo(e) {
    e.preventDefault();
    const userId = document.getElementById('infoUserId').value;
    const newName = document.getElementById('infoName').value;
    const newPassword = document.getElementById('infoPassword').value;
    if (confirm("정보를 수정하시겠습니까?")) {
        UI.showToast('처리 중...', 'info');
        const res = await API.post('updateUserInfo', { userId, name: newName, password: newPassword });
        if (res.success) {
            UI.showToast('정보가 수정되었습니다.');
            const user = JSON.parse(localStorage.getItem('currentUser'));
            user.이름 = newName;
            localStorage.setItem('currentUser', JSON.stringify(user));
            if (document.getElementById('headerUserName')) document.getElementById('headerUserName').innerText = newName;
        } else { UI.showToast(res.message || '수정 실패', 'error'); }
    }
}

async function withdrawUser() {
    if (confirm("정말로 탈퇴하시겠습니까? 모든 대여 기록이 삭제됩니다.")) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const res = await API.post('withdrawUser', { userId: user.userId || user.아이디 });
        if (res.success) {
            alert("회원 탈퇴가 완료되었습니다.");
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        } else { UI.showToast(res.message || "탈퇴 처리 중 오류 발생", "error"); }
    }
}

async function loadMyRentals(type = 'current') {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const res = await API.post('getMyRentals', { userId: user.userId || user.아이디 });
    const tbody = document.getElementById('myRentalsTableBody');
    if (!tbody) return;
    const btnCurrent = document.getElementById('btnCurrentRentals');
    const btnHistory = document.getElementById('btnRentalHistory');
    if (btnCurrent && btnHistory) {
        btnCurrent.classList.remove('active'); btnHistory.classList.remove('active');
        type === 'current' ? btnCurrent.classList.add('active') : btnHistory.classList.add('active');
        btnCurrent.onclick = () => loadMyRentals('current');
        btnHistory.onclick = () => loadMyRentals('history');
    }
    if (res.success && res.data.length > 0) {
        const currentRentals = res.data.filter(r => String(r.반납여부 || "").trim().toUpperCase() !== 'Y');
        const historyRentals = res.data.filter(r => String(r.반납여부 || "").trim().toUpperCase() === 'Y');
        const targetData = type === 'current' ? currentRentals : historyRentals;
        if (targetData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="empty-message">${type === 'current' ? '대여 중인 도서가 없습니다.' : '대출 이력이 없습니다.'}</td></tr>`;
            return;
        }
        tbody.innerHTML = targetData.reverse().map(r => {
            const rId = r.대여ID || r.rentalId || r[0];
            return `<tr>
                <td class="title" title="${r.도서명 || r.제목}">${r.도서명 || r.제목}</td>
                <td>${r.대여일 || '-'}</td>
                <td>${type === 'current' ? (r.반납예정일 || '-') : (r.반납일 || '반납완료')}</td>
                <td>${type === 'current' ? `<div style="display:flex; gap:6px; justify-content:center;"><button class="btn-rent" style="background-color:var(--primary);" onclick="returnBook('${rId}', '${r.ISBN || r.isbn}')">반납</button><button class="btn-rent" style="background-color:var(--danger);" onclick="deleteRental('${rId}', '${r.ISBN || r.isbn}')">삭제</button></div>` : `<span style="color:var(--text-light); font-size:13px; font-weight:600;">반납완료</span>`}</td>
            </tr>`;
        }).join('');
    } else { tbody.innerHTML = `<tr><td colspan="4" class="empty-message">대여 정보가 없습니다.</td></tr>`; }
}
