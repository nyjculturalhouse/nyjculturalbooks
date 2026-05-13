let allBooks = [];

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth(false);
    if (!user) return;

    document.getElementById('headerUserName').innerText = user.name;
    document.getElementById('infoUserId').value = user.userId;
    document.getElementById('infoName').value = user.name;

    setupTabs();
    loadBooks();
    loadMyRentals();

    // 로그아웃
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 도서 검색
    document.getElementById('searchBookInput').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = allBooks.filter(b => 
            String(b.title).toLowerCase().includes(keyword) || 
            String(b.author).toLowerCase().includes(keyword) ||
            String(b.isbn).includes(keyword)
        );
        renderBooks(filtered);
    });

    // 정보 수정
    document.getElementById('updateInfoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('infoName').value;
        const newPassword = document.getElementById('infoPassword').value;
        const res = await API.post('updateUser', { userId: user.userId, newName, newPassword });
        if (res.success) {
            UI.showToast('정보가 수정되었습니다.');
            user.name = newName;
            localStorage.setItem('currentUser', JSON.stringify(user));
            document.getElementById('headerUserName').innerText = user.name;
            document.getElementById('infoPassword').value = '';
        }
    });

    // 회원 탈퇴
    document.getElementById('btnWithdraw').addEventListener('click', async () => {
        if (confirm('정말 탈퇴하시겠습니까? 복구할 수 없습니다.')) {
            const res = await API.post('deleteUser', { userId: user.userId });
            if (res.success) {
                alert('탈퇴 처리되었습니다.');
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        }
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
    tbody.innerHTML = '';
    books.forEach(b => {
        const isAvailable = b.status === 'AVAILABLE';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${b.isbn}</td><td>${b.title}</td><td>${b.pages}</td><td>${b.author}</td><td>${b.publisher}</td>
            <td><span class="badge ${isAvailable ? 'available' : 'rented'}">${isAvailable ? '대여가능' : '대여중'}</span></td>
            <td><button class="btn-sm ${isAvailable ? 'btn-primary' : 'btn-outline'}" 
                ${!isAvailable ? 'disabled' : ''} onclick="rentBook('${b.isbn}')">대여</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function rentBook(isbn) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (confirm('이 도서를 대여하시겠습니까?')) {
        const res = await API.post('rentBook', { userId: user.userId, isbn });
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
    const res = await API.post('getMyRentals', { userId: user.userId });
    if (res.success) {
        const tbody = document.getElementById('myRentalsTableBody');
        tbody.innerHTML = '';
        res.data.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.isbn}</td><td>${r.title}</td>
                <td>${new Date(r.rentalDate).toLocaleDateString()}</td>
                <td>${new Date(r.dueDate).toLocaleDateString()}</td>
                <td><button class="btn-sm btn-secondary" onclick="returnBook('${r.rentalId}', '${r.isbn}')">반납</button></td>
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
