let allBooks = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. 사용자 인증 확인
    const user = typeof checkAuth === 'function' ? checkAuth(false) : JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 2. 상단 사용자 정보 표시
    const displayUserId = user.아이디 || user.userId || user.id;
    const displayName = user.이름 || user.name || displayUserId;

    document.getElementById('headerUserName').innerText = displayName;
    if(document.getElementById('infoUserId')) document.getElementById('infoUserId').value = displayUserId;
    if(document.getElementById('infoName')) document.getElementById('infoName').value = displayName;

    // 3. 초기 데이터 로드
    if (typeof setupTabs === 'function') setupTabs();
    loadBooks();
    loadMyRentals();

    // 4. 로그아웃 이벤트
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 5. 도서 검색 로직 (ISBN 열이 없어도 데이터로 검색 가능)
    document.getElementById('searchBookInput').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = allBooks.filter(b => {
            const title = String(b.도서명 || b.제목 || b.title || '').toLowerCase();
            const author = String(b.저자 || b.작가 || b.author || '').toLowerCase();
            const isbn = String(b.ISBN || b.isbn || '').toLowerCase();
            return title.includes(keyword) || author.includes(keyword) || isbn.includes(keyword);
        });
        renderBooks(filtered);
    });

    // 6. 개인 정보 수정
    const updateForm = document.getElementById('updateInfoForm');
    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = document.getElementById('infoName').value;
            const newPassword = document.getElementById('infoPassword').value;
            const res = await API.post('updateUser', { 
                userId: displayUserId, 
                newName, 
                newPassword 
            });
            if (res.success) {
                UI.showToast('정보가 수정되었습니다.');
                user.name = newName;
                user.이름 = newName;
                localStorage.setItem('currentUser', JSON.stringify(user));
                document.getElementById('headerUserName').innerText = newName;
                document.getElementById('infoPassword').value = '';
            }
        });
    }

    // 7. 회원 탈퇴
    const btnWithdraw = document.getElementById('btnWithdraw');
    if (btnWithdraw) {
        btnWithdraw.addEventListener('click', async () => {
            if (confirm('정말 탈퇴하시겠습니까? 복구할 수 없습니다.')) {
                const res = await API.post('deleteUser', { userId: displayUserId });
                if (res.success) {
                    alert('탈퇴 처리되었습니다.');
                    localStorage.removeItem('currentUser');
                    window.location.href = 'index.html';
                }
            }
        });
    }
});

// 전체 도서 목록 불러오기
async function loadBooks() {
    const res = await API.post('getBooks');
    if (res.success) {
        allBooks = res.data;
        renderBooks(allBooks);
    }
}

// 도서 목록 렌더링 (ISBN 열 제외 & 너비 고정 적용)
function renderBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    books.forEach(b => {
        const isbn = b.ISBN || b.isbn || '-';
        const title = b.도서명 || b.제목 || b.title || '-';
        const category = b.카테고리 || b.분류 || b.category || '-';
        const author = b.저자 || b.작가 || b.author || '-';
        const statusText = b.상태 || b.대여상태 || '정보없음';
        
        const isAvailable = statusText.includes('가능') || statusText === 'AVAILABLE';

        const tr = document.createElement('tr');
        // ISBN td 삭제 및 가로 유지를 위한 인라인 스타일 보강
        tr.innerHTML = `
            <td title="${title}" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</td>
            <td style="white-space: nowrap;">${category}</td>
            <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${author}</td>
            <td style="text-align: center;">
                <span class="badge ${isAvailable ? 'available' : 'rented'}">
                    ${isAvailable ? '대여가능' : '대여중'}
                </span>
            </td>
            <td style="text-align: center;">
                <button class="btn-sm ${isAvailable ? 'btn-primary' : 'btn-outline'}" 
                    ${!isAvailable ? 'disabled' : ''} onclick="rentBook('${isbn}')">대여</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 도서 대여 신청
async function rentBook(isbn) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.아이디 || user.userId || user.id;
    
    if (confirm(`도서를 대여하시겠습니까?`)) {
        const res = await API.post('rentBook', { userId: userId, isbn });
        if (res.success) {
            UI.showToast('대여가 완료되었습니다.');
            loadBooks();
            loadMyRentals();
        } else {
            UI.showToast(res.message, 'error');
        }
    }
}

// 내 대여 현황 렌더링 (ISBN 열 제외)
async function loadMyRentals() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.아이디 || user.userId || user.id;
    
    const res = await API.post('getMyRentals', { userId: userId });
    if (res.success) {
        const tbody = document.getElementById('myRentalsTableBody');
        if(!tbody) return;
        tbody.innerHTML = '';
        res.data.forEach(r => {
            const isbn = r.ISBN || r.isbn || '-';
            const title = r.도서명 || r.제목 || r.title || '-';
            const rentalId = r.대여ID || r.rentalId;
            
            const tr = document.createElement('tr');
            // 내 대여 목록에서도 ISBN을 빼고 제목/대여일/반납일만 표시
            tr.innerHTML = `
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</td>
                <td style="white-space: nowrap;">${r.대여일 ? new Date(r.대여일).toLocaleDateString() : '-'}</td>
                <td style="white-space: nowrap;">${r.반납예정일 ? new Date(r.반납예정일).toLocaleDateString() : '-'}</td>
                <td style="text-align: center;">
                    <button class="btn-sm btn-secondary" onclick="returnBook('${rentalId}', '${isbn}')">반납</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// 도서 반납 처리
async function returnBook(rentalId, isbn) {
    if (confirm('도서를 반납하시겠습니까?')) {
        const res = await API.post('returnBook', { rentalId, isbn });
        if (res.success) {
            UI.showToast('반납 처리되었습니다.');
            loadBooks();
            loadMyRentals();
        } else {
            UI.showToast(res.message, 'error');
        }
    }
}
