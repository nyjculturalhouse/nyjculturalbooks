document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth(true); 
    if (!user) return;

    document.getElementById('headerUserName').innerText = user.이름 || user.name;
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
        tbody.innerHTML = '';
        res.data.forEach(b => {
            const isAvailable = b.상태 === '대여 가능';
            tbody.innerHTML += `<tr>
                <td>${b.ISBN || '-'}</td>
                <td>${b.제목 || '-'}</td>
                <td>${b.저자 || '-'}</td>
                <td><span class="badge ${isAvailable ? 'available' : 'rented'}">${b.상태 || '대여 불가'}</span></td>
                <td>
                    <button class="btn-sm btn-outline" onclick='openEditModal(${JSON.stringify(b)})'>수정</button>
                    <button class="btn-sm btn-danger" onclick="deleteBook('${b.ISBN}')">삭제</button>
                </td>
            </tr>`;
        });
    }
}

function openEditModal(book) {
    document.getElementById('editIsbn').value = book.ISBN || '';
    document.getElementById('editTitle').value = book.제목 || '';
    document.getElementById('editCategory').value = book.카테고리 || '';
    document.getElementById('editAuthor').value = book.저자 || '';
    document.getElementById('editPublisher').value = book.출판사 || '';
    document.getElementById('editBookModal').classList.remove('hidden');
}

async function deleteBook(isbn) {
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
        tbody.innerHTML = '';
        res.data.forEach(u => {
            tbody.innerHTML += `<tr>
                <td>${u.아이디 || '-'}</td>
                <td>${u.이름 || '-'}</td>
                <td>${u.권한 || '-'}</td>
                <td>${u.생성일 ? new Date(u.생성일).toLocaleDateString() : '-'}</td>
            </tr>`;
        });
    }
}

async function loadRentalHistory() {
    const res = await API.post('getRentalHistory');
    if (res.success) {
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';
        res.data.forEach(r => {
            const isReturned = String(r.반납여부) === 'true';
            tbody.innerHTML += `<tr>
                <td>${r.대여ID || '-'}</td>
                <td>${r.아이디 || '-'}</td>
                <td>${r.ISBN || '-'}</td>
                <td>${r.제목 || '-'}</td>
                <td>${r.대여일 ? new Date(r.대여일).toLocaleDateString() : '-'}</td>
                <td>${r.반납예정일 ? new Date(r.반납예정일).toLocaleDateString() : '-'}</td>
                <td><span class="badge ${isReturned ? 'available' : 'rented'}">${isReturned ? '반납완료' : '대여중'}</span></td>
            </tr>`;
        });
    }
}

async function loadCurrentRentals() {
    const res = await API.post('getCurrentRentals');
    if (res.success) {
        const tbody = document.getElementById('currentRentalsTableBody');
        tbody.innerHTML = '';
        res.data.forEach(r => {
            tbody.innerHTML += `<tr>
                <td>${r.대여ID || '-'}</td>
                <td>${r.아이디 || '-'}</td>
                <td>${r.제목 || '-'}</td>
                <td>${r.대여일 ? new Date(r.대여일).toLocaleDateString() : '-'}</td>
                <td>${r.반납예정일 ? new Date(r.반납예정일).toLocaleDateString() : '-'}</td>
            </tr>`;
        });
    }
}
