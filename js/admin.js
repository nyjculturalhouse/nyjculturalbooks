document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth(true); // 관리자 권한 필수
    if (!user) return;

    document.getElementById('headerUserName').innerText = user.name;
    setupTabs();
    
    loadAllData();

    // 네비게이션 클릭 시 데이터 새로고침
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', loadAllData);
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 신규 도서 등록
    document.getElementById('addBookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            isbn: document.getElementById('addIsbn').value,
            title: document.getElementById('addTitle').value,
            pages: document.getElementById('addPages').value,
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

    // 모달 닫기
    document.getElementById('btnCancelEdit').addEventListener('click', () => {
        document.getElementById('editBookModal').classList.add('hidden');
    });

    // 도서 수정 제출
    document.getElementById('editBookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            isbn: document.getElementById('editIsbn').value,
            title: document.getElementById('editTitle').value,
            pages: document.getElementById('editPages').value,
            author: document.getElementById('editAuthor').value,
            publisher: document.getElementById('editPublisher').value
        };
        const res = await API.post('updateBook', payload);
        if (res.success) {
            UI.showToast('도서가 수정되었습니다.');
            document.getElementById('editBookModal').classList.add('hidden');
            loadAdminBooks();
        }
    });
});

function loadAllData() {
    loadUsers();
    loadAdminBooks();
    loadRentalHistory();
    loadCurrentRentals();
}

async function loadUsers() {
    const res = await API.post('getUsers');
    if (res.success) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        res.data.forEach(u => {
            tbody.innerHTML += `<tr><td>${u.userId}</td><td>${u.name}</td><td>${u.role}</td>
                                <td>${new Date(u.createdAt).toLocaleDateString()}</td></tr>`;
        });
    }
}

async function loadAdminBooks() {
    const res = await API.post('getBooks');
    if (res.success) {
        const tbody = document.getElementById('adminBooksTableBody');
        tbody.innerHTML = '';
        res.data.forEach(b => {
            const isAvailable = b.status === 'AVAILABLE';
            tbody.innerHTML += `<tr>
                <td>${b.isbn}</td><td>${b.title}</td><td>${b.author}</td>
                <td><span class="badge ${isAvailable ? 'available' : 'rented'}">${b.status}</span></td>
                <td>
                    <button class="btn-sm btn-outline" onclick='openEditModal(${JSON.stringify(b)})'>수정</button>
                    <button class="btn-sm btn-danger" onclick="deleteBook('${b.isbn}')">삭제</button>
                </td>
            </tr>`;
        });
    }
}

function openEditModal(book) {
    document.getElementById('editIsbn').value = book.isbn;
    document.getElementById('editTitle').value = book.title;
    document.getElementById('editPages').value = book.pages;
    document.getElementById('editAuthor').value = book.author;
    document.getElementById('editPublisher').value = book.publisher;
    document.getElementById('editBookModal').classList.remove('hidden');
}

async function deleteBook(isbn) {
    if (confirm('도서를 삭제하시겠습니까?')) {
        const res = await API.post('deleteBook', { isbn });
        if (res.success) {
            UI.showToast('삭제되었습니다.');
            loadAdminBooks();
        } else {
            UI.showToast(res.message, 'error');
        }
    }
}

async function loadRentalHistory() {
    const res = await API.post('getRentalHistory');
    if (res.success) {
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';
        res.data.forEach(r => {
            const status = String(r.returned) === 'true' ? '반납완료' : '대여중';
            tbody.innerHTML += `<tr>
                <td>${r.rentalId}</td><td>${r.userId}</td><td>${r.isbn}</td><td>${r.title}</td>
                <td>${new Date(r.rentalDate).toLocaleDateString()}</td>
                <td>${new Date(r.dueDate).toLocaleDateString()}</td>
                <td><span class="badge ${status==='반납완료' ? 'available' : 'rented'}">${status}</span></td>
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
                <td>${r.rentalId}</td><td>${r.userId}</td><td>${r.title}</td>
                <td>${new Date(r.rentalDate).toLocaleDateString()}</td>
                <td>${new Date(r.dueDate).toLocaleDateString()}</td>
            </tr>`;
        });
    }
}
