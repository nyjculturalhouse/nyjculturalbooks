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
            // 변수명 오류 해결: 공백 제거
            const isAvailable = b.상태 === '대여 가능';
            
            tbody.innerHTML += `<tr>
                <td>${b.ISBN || '-'}</td>
                <td>${b.제목 || '-'}</td>
                <td>${b.저자 || '-'}</td>
                <td><span class="badge ${isAvailable ? 'status-available' : 'status-rented'}">${b.상태 || '대여 불가'}</span></td>
                <td>
                    <button class="btn-sm btn-outline" onclick='openEditModal(${JSON.stringify(b)})'>수정</button>
                    <button class="btn-sm btn-danger" onclick="deleteBook('${b.ISBN}')">삭제</button>
                </td>
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
            const statusLabel = isReturned ? '반납완료' : '대여중';
            
            tbody.innerHTML += `<tr>
                <td>${r.대여ID || '-'}</td>
                <td>${r.아이디 || '-'}</td>
                <td>${r.ISBN || '-'}</td>
                <td>${r.제목 || '-'}</td>
                <td>${r.대여일 ? new Date(r.대여일).toLocaleDateString() : '-'}</td>
                <td>${r.반납예정일 ? new Date(r.반납예정일).toLocaleDateString() : '-'}</td>
                <td><span class="badge ${isReturned ? 'status-available' : 'status-rented'}">${statusLabel}</span></td>
            </tr>`;
        });
    }
}

// ... 기타 loadUsers, loadCurrentRentals 함수 등 기존 로직 유지 ...
