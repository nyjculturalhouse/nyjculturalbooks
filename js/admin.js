document.addEventListener('DOMContentLoaded', () => {
    // 관리자 권한 체크
    const user = checkAuth(true); 
    if (!user) return;

    document.getElementById('headerUserName').innerText = user.이름 || user.name;
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
            category: document.getElementById('editCategory').value,
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
            // 시트 헤더 명칭과 정확히 일치시켜야 함 (아이디, 이름, 권한, 생성일)
            tbody.innerHTML += `<tr>
                <td>${u.아이디 || '-'}</td>
                <td>${u.이름 || '-'}</td>
                <td>${u.권한 || '-'}</td>
                <td>${u.생성일 ? new Date(u.생성일).toLocaleDateString() : '-'}</td>
            </tr>`;
        });
    }
}

async function loadAdminBooks() {
    const res = await API.post('getBooks');
    if (res.success) {
        const tbody = document.getElementById('adminBooksTableBody');
        tbody.innerHTML = '';
        res.data.forEach(b => {
            // 상태 값이 '대여 가능'인지 확인
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
    // 시트에서 가져온 한글 필드명을 매칭
    document.getElementById('editIsbn').value = book.ISBN || '';
    document.getElementById('editTitle').value = book.제목 || '';
    document.getElementById('editCategory').value = book.카테고리 || '';
    document.getElementById('editAuthor').value = book.저자 || '';
    document.getElementById('editPublisher').value = book.출판사 || '';
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
            // 반납여부가 true(반납완료)인지 확인
            const status = String(r.반납여부) === 'true' ? '반납완료' : '대여중';
            tbody.innerHTML += `<tr>
                <td>${r.대여ID || '-'}</td>
                <td>${r.아이디 || '-'}</td>
                <td>${r.ISBN || '-'}</td>
                <td>${r.제목 || '-'}</td>
                <td>${r.대여일 ? new Date(r.대여일).toLocaleDateString() : '-'}</td>
                <td>${r.반납예정일 ? new Date(r.반납예정일).toLocaleDateString() : '-'}</td>
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
                <td>${r.대여ID || '-'}</td>
                <td>${r.아이디 || '-'}</td>
                <td>${r.제목 || '-'}</td>
                <td>${r.대여일 ? new Date(r.대여일).toLocaleDateString() : '-'}</td>
                <td>${r.반납예정일 ? new Date(r.반납예정일).toLocaleDateString() : '-'}</td>
            </tr>`;
        });
    }
}
