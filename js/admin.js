let allBooks = []; // 데이터를 안전하게 보관할 전역 변수

document.addEventListener('DOMContentLoaded', () => {
    // 관리자 권한 체크 (checkAuth가 true면 ADMIN 권한 확인)
    const user = typeof checkAuth === 'function' ? checkAuth(true) : JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 이름 표시 로직 보강
    const nameEl = document.getElementById('headerUserName');
    if (nameEl) nameEl.innerText = user.이름 || user.name || user.아이디 || '관리자';

    if (typeof setupTabs === 'function') setupTabs();
    loadAllData();

    // 탭 클릭 시 데이터 새로고침
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', loadAllData);
    });

    // 로그아웃
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 도서 등록
    document.getElementById('addBookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            isbn: document.getElementById('addIsbn').value,
            title: document.getElementById('addTitle').value,
            category: document.getElementById('addCategory').value,
            author: document.getElementById('addAuthor').value,
            publisher: document.getElementById('addPublisher').value
        };
        const res = await API.post('addBook', payload);
        if (res.success) {
            UI.showToast('도서가 등록되었습니다.');
            document.getElementById('addBookForm').reset();
            loadAdminBooks();
        } else {
            UI.showToast(res.message, 'error');
        }
    });

    // 도서 수정 제출
    document.getElementById('editBookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            isbn: document.getElementById('editIsbn').value,
            title: document.getElementById('editTitle').value,
            category: document.getElementById('editCategory').value,
            author: document.getElementById('editAuthor').value,
            publisher: document.getElementById('editPublisher').value
        };
        const res = await API.post('updateBook', payload);
        if (res.success) {
            UI.showToast('도서가 수정되었습니다.');
            document.getElementById('editBookModal').classList.add('hidden');
            loadAdminBooks();
        } else {
            UI.showToast(res.message, 'error');
        }
    });

    // 수정 취소
    document.getElementById('btnCancelEdit').addEventListener('click', () => {
        document.getElementById('editBookModal').classList.add('hidden');
    });
});

function loadAllData() {
    loadUsers();
    loadAdminBooks();
    loadRentalHistory();
    loadCurrentRentals();
}

async function loadAdminBooks() {
    const res = await API.post('getBooks');
    if (res.success) {
        const tbody = document.getElementById('adminBooksTableBody');
        if(!tbody) return;
        
        allBooks = res.data; 
        tbody.innerHTML = '';
        
        allBooks.forEach((b, index) => {
            // 한글/영문 헤더 완벽 대응
            const isbn = b.ISBN || b.isbn || '-';
            const title = b.도서명 || b.제목 || b.title || '-';
            const category = b.카테고리 || b.분류 || b.category || '-';
            const author = b.저자 || b.작가 || b.author || '-';
            const publisher = b.출판사 || b.publisher || '-';
            const statusText = b.상태 || b.대여상태 || '대여 가능';
            
            const isAvailable = statusText.includes('가능') || statusText === 'AVAILABLE';
            
            tbody.innerHTML += `
                <tr>
                    <td>${isbn}</td>
                    <td>${title}</td>
                    <td>${category}</td>
                    <td>${author}</td>
                    <td>${publisher}</td>
                    <td><span class="badge ${isAvailable ? 'available' : 'rented'}">${statusText}</span></td>
                    <td>
                        <button class="btn-sm btn-outline" onclick="openEditByIndex(${index})">수정</button>
                        <button class="btn-sm btn-danger" onclick="deleteBook('${isbn}')">삭제</button>
                    </td>
                </tr>`;
        });
    }
}

function openEditByIndex(index) {
    const book = allBooks[index];
    if (!book) return;

    // 모달 필드 채우기 (다양한 키값 대응)
    document.getElementById('editIsbn').value = book.ISBN || book.isbn || '';
    document.getElementById('editTitle').value = book.도서명 || book.제목 || book.title || '';
    document.getElementById('editCategory').value = book.카테고리 || book.분류 || book.category || '';
    document.getElementById('editAuthor').value = book.저자 || book.작가 || book.author || '';
    document.getElementById('editPublisher').value = book.출판사 || book.publisher || '';
    
    document.getElementById('editBookModal').classList.remove('hidden');
}

async function deleteBook(isbn) {
    if (!isbn || isbn === '-') return UI.showToast('ISBN 정보가 올바르지 않습니다.', 'error');
    if (confirm(`ISBN: ${isbn} 도서를 정말 삭제하시겠습니까?`)) {
        const res = await API.post('deleteBook', { isbn });
        if (res.success) {
            UI.showToast('삭제되었습니다.');
            loadAdminBooks();
        } else {
            UI.showToast(res.message, 'error');
        }
    }
}

async function loadUsers() {
    const res = await API.post('getUsers');
    if (res.success) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        res.data.forEach(u => {
            tbody.innerHTML += `<tr>
                <td>${u.아이디 || u.userId || '-'}</td>
                <td>${u.이름 || u.name || '-'}</td>
                <td>${u.권한 || u.role || '-'}</td>
                <td>${u.생성일 || u.createdAt || '-'}</td>
            </tr>`;
        });
    }
}

async function loadRentalHistory() {
    const res = await API.post('getRentalHistory');
    if (res.success) {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        res.data.forEach(r => {
            const returnedVal = String(r.반납여부 || r.isReturned).toLowerCase();
            const isReturned = returnedVal === 'true' || returnedVal === 'y';
            
            tbody.innerHTML += `<tr>
                <td>${r.대여ID || r.rentalId || '-'}</td>
                <td>${r.아이디 || r.userId || '-'}</td>
                <td>${r.ISBN || r.isbn || '-'}</td>
                <td>${r.도서명 || r.제목 || r.title || '-'}</td>
                <td>${r.대여일 || r.rentalDate || '-'}</td>
                <td>${r.반납예정일 || r.dueDate || '-'}</td>
                <td><span class="badge ${isReturned ? 'available' : 'rented'}">${isReturned ? '반납완료' : '대여중'}</span></td>
            </tr>`;
        });
    }
}

async function loadCurrentRentals() {
    const res = await API.post('getCurrentRentals');
    if (res.success) {
        const tbody = document.getElementById('currentRentalsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        res.data.forEach(r => {
            tbody.innerHTML += `<tr>
                <td>${r.대여ID || r.rentalId || '-'}</td>
                <td>${r.아이디 || r.userId || '-'}</td>
                <td>${r.도서명 || r.제목 || r.title || '-'}</td>
                <td>${r.대여일 || r.rentalDate || '-'}</td>
                <td>${r.반납예정일 || r.dueDate || '-'}</td>
            </tr>`;
        });
    }
}
