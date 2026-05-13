let allBooks = [];

document.addEventListener('DOMContentLoaded', () => {
    // auth.js에 정의된 checkAuth 함수 호출 (없을 시 user 관리 로직으로 대체 가능)
    const user = typeof checkAuth === 'function' ? checkAuth(false) : JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 상단 사용자 정보 표시 (한글/영문 키값 모두 대응)
    const displayUserId = user.아이디 || user.userId || user.id;
    const displayName = user.이름 || user.name || displayUserId;

    document.getElementById('headerUserName').innerText = displayName;
    if(document.getElementById('infoUserId')) document.getElementById('infoUserId').value = displayUserId;
    if(document.getElementById('infoName')) document.getElementById('infoName').value = displayName;

    if (typeof setupTabs === 'function') setupTabs();
    loadBooks();
    loadMyRentals();

    // 로그아웃
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 도서 검색 로직 보강
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

    // 정보 수정
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

    // 회원 탈퇴
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

async function loadBooks() {
    const res = await API.post('getBooks');
    if (res.success) {
        allBooks = res.data;
        renderBooks(allBooks);
    }
}

// undefined 방지를 위한 렌더링 함수 수정
function renderBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    books.forEach(b => {
        // 시트 헤더 명칭에 따른 유연한 매핑 (핵심 수정 사항)
        const isbn = b.ISBN || b.isbn || '-';
        const title = b.도서명 || b.제목 || b.title || '-';
        const category = b.카테고리 || b.분류 || b.category || '-';
        const author = b.저자 || b.작가 || b.author || '-';
        const publisher = b.출판사 || b.publisher || '-';
        const statusText = b.상태 || b.대여상태 || '정보없음';
        
        // 상태값에 따른 대여 가능 여부 체크
        const isAvailable = statusText.includes('가능') || statusText === 'AVAILABLE';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${isbn}</td>
            <td>${title}</td>
            <td>${category}</td>
            <td>${author}</td>
            <td>${publisher}</td>
            <td><span class="badge ${isAvailable ? 'available' : 'rented'}">${isAvailable ? '대여가능' : '대여중'}</span></td>
            <td>
                <button class="btn-sm ${isAvailable ? 'btn-primary' : 'btn-outline'}" 
                ${!isAvailable ? 'disabled' : ''} onclick="rentBook('${isbn}')">대여</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function rentBook(isbn) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.아이디 || user.userId || user.id;
    
    if (confirm(`[${isbn}] 도서를 대여하시겠습니까?`)) {
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
            tr.innerHTML = `
                <td>${isbn}</td>
                <td>${title}</td>
                <td>${r.대여일 ? new Date(r.대여일).toLocaleDateString() : '-'}</td>
                <td>${r.반납예정일 ? new Date(r.반납예정일).toLocaleDateString() : '-'}</td>
                <td><button class="btn-sm btn-secondary" onclick="returnBook('${rentalId}', '${isbn}')">반납</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

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
