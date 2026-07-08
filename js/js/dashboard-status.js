document.addEventListener('DOMContentLoaded', () => {
    loadStatus();
});

async function loadStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert("로그인이 필요합니다.");
        window.location.href = 'index.html';
        return;
    }

    // API를 통해 사용자의 대여 목록 호출
    // API.post('getMyRentals', ...)는 dashboard-user.js에 있던 함수와 동일하게 활용합니다.
    const res = await API.post('getMyRentals', { userId: user.userId || user.아이디 });
    
    const container = document.getElementById('rentStatusContainer');
    if (!container) return;

    if (res.success && res.data && res.data.length > 0) {
        // 데이터 필터링: 본인 아이디와 일치하는 것만 보여주거나, 이미 API에서 본인것만 가져온다면 바로 렌더링
        container.innerHTML = res.data.map(item => `
            <tr>
                <td style="font-weight: 400;">${item.도서명 || item.제목}</td>
                <td>${item.대여일 || '-'}</td>
                <td>${item.반납예정일 || '-'}</td>
                <td><span class="badge ${item.반납여부 === 'Y' ? '' : 'badge-renting'}">${item.반납여부 === 'Y' ? '반납완료' : '대여중'}</span></td>
                <td>${item.반납여부 !== 'Y' ? `<button class="btn-return" onclick="returnBook('${item.대여ID}')">반납하기</button>` : '-'}</td>
            </tr>
        `).join('');
    } else {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center;">대여 중인 도서가 없습니다.</td></tr>';
    }
}

// 반납 함수 (필요 시)
async function returnBook(rentalId) {
    if(confirm("정말로 반납하시겠습니까?")) {
        // 반납 API 호출 로직
        const res = await API.post('returnBook', { rentalId });
        if(res.success) {
            alert("반납되었습니다.");
            location.reload();
        }
    }
}
