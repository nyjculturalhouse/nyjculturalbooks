let allBooks = []; // 데이터를 안전하게 보관할 전역 변수

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth(true); 
    if (!user) return;

    // 이름 표시 로직 보강
    const nameEl = document.getElementById('headerUserName');
    if (nameEl) nameEl.innerText = user.이름 || user.아이디 || '관리자';

    setupTabs();
    loadAllData();

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', loadAllData);
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

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
        
        allBooks = res.data; // 서버에서 받은 데이터를 전역 변수에 저장
        tbody.innerHTML = '';
        
        allBooks.forEach((b, index) => {
            const title = b.제목 || b.도서명 || '-';
            const isbn = b.ISBN || b.isbn || '-';
            const category = b.카테고리 || b.분류 || '-';
            const author = b.저자 || b.작가 || '-';
            const publisher = b.출판사 || '-';
            const status = b.상태 || '대여 가능';
            
            const isAvailable = status === '대여 가능';
            
            // 중요: JSON.stringify 대신 index를 사용하여 SyntaxError 방지
            tbody.innerHTML += `
                <tr>
                    <td>${isbn}</td>
                    <td>${title}</td>
                    <td>${category}</td>
                    <td>${author}</td>
                    <td>${publisher}</td>
                    <td><span class="badge ${isAvailable ? 'available' : 'rented'}">${status}</span></td>
                    <td>
                        <button class="btn-sm btn-outline" onclick="openEditByIndex(${index})">수정</button>
                        <button class="btn-sm btn-danger" onclick="deleteBook('${isbn}')">삭제</button>
                    </td>
                </tr>`;
        });
    }
}

// index를 사용하여 전역 변수에서 책 정보를 가져오는 방식
function openEditByIndex(index) {
    const book = allBooks[index];
    if (!book) return;

    document.getElementById('editIsbn').value = book.ISBN || book.isbn || '';
    document.getElementById('editTitle').value = book.제목 || book.도서명 || '';
    document.getElementById('editCategory').value = book.카테고리 || book.분류 || '';
    document.getElementById('editAuthor').value = book.저자 || book.작가 || '';
    document.getElementById('editPublisher').value = book.출판사 || '';
    document.getElementById('editBookModal').classList.remove('hidden');
}

async function deleteBook(isbn) {
    if (!isbn || isbn === '-') return UI.showToast('ISBN 정보가 올바르지 않습니다.', 'error');
    if (confirm('정말 삭제하시겠습니까?')) {
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
                <td>${u.아이디 || '-'}</td>
                <td>${u.이름 || '-'}</td>
                <td>${u.권한 || '-'}</td>
                <td>${u.생성일 || '-'}</td>
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
            const isReturned = String(r.반납여부).toLowerCase() === 'true';
            tbody.innerHTML += `<tr>
                <td>${r.대여ID || '-'}</td>
                <td>${r.아이디 || '-'}</td>
                <td>${r.ISBN || '-'}</td>
                <td>${r.제목 || '-'}</td>
                <td>${r.대여일 || '-'}</td>
                <td>${r.반납예정일 || '-'}</td>
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
                <td>${r.대여ID || '-'}</td>
                <td>${r.아이디 || '-'}</td>
                <td>${r.제목 || '-'}</td>
                <td>${r.대여일 || '-'}</td>
                <td>${r.반납예정일 || '-'}</td>
            </tr>`;
        });
    }
}
