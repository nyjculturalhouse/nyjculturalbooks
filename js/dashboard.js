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

    // 4. 로그아웃
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 5. 검색 로직
    document.getElementById('searchBookInput').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = allBooks.filter(b => {
            const title = String(b.도서명 || b.제목 || b.title || '').toLowerCase();
            const author = String(b.저자 || b.작가 || b.author || '').toLowerCase();
            return title.includes(keyword) || author.includes(keyword);
        });
        renderBooks(filtered);
    });
});

async function loadBooks() {
    const res = await API.post('getBooks');
    if (res.success) {
        allBooks = res.data;
        renderBooks(allBooks);
    }
}

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
        tr.innerHTML = `
            <td title="${title}" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</td>
            <td>${category}</td>
            <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${author}</td>
            <td style="text-align: center;">
                <span class="badge ${isAvailable ? 'available' : 'rented'}">${isAvailable ? '대여가능' : '대여중'}</span>
            </td>
            <td style="text-align: center;">
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
    if (confirm(`도서를 대여하시겠습니까?`)) {
        const res = await API.post('rentBook', { userId, isbn });
        if (res.success) {
            UI.showToast('대여 완료!');
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
    const res = await API.post('getMyRentals', { userId });
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
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</td>
                <td>${r.대여일 ? new Date(r.대여일).toLocaleDateString() : '-'}</td>
                <td>${r.반납예정일 ? new Date(r.반납예정일).toLocaleDateString() : '-'}</td>
                <td style="text-align: center;">
                    <button class="btn-sm btn-secondary" onclick="returnBook('${rentalId}', '${isbn}')">반납</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function returnBook(rentalId, isbn) {
    if (confirm('반납하시겠습니까?')) {
        const res = await API.post('returnBook', { rentalId, isbn });
        if (res.success) {
            UI.showToast('반납 완료!');
            loadBooks();
            loadMyRentals();
        }
    }
}
