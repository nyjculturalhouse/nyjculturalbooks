let allBooks = []; // 데이터를 안전하게 보관할 전역 변수

document.addEventListener('DOMContentLoaded', () => {
    // 관리자 권한 체크
    const user = typeof checkAuth === 'function' ? checkAuth(true) : JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 이름 표시 로직
    const nameEl = document.getElementById('headerUserName');
    if (nameEl) nameEl.innerText = user.이름 || user.name || user.아이디 || '관리자';

    if (typeof setupTabs === 'function') setupTabs();
    
    // 첫 페이지 진입 시에는 '첫 번째 활성화된 탭'의 데이터만 로드합니다.
    const activeTab = document.querySelector('.nav-item.active');
    if (activeTab) {
        const targetView = activeTab.getAttribute('data-target');
        loadDataByTarget(targetView);
    } else {
        loadUsers();
    }

    // 클릭한 탭의 데이터만 선별 로드
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const targetView = e.currentTarget.getAttribute('data-target');
            if (targetView) {
                loadDataByTarget(targetView);
            }
        });
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
            closeEditModal(); 
            loadAdminBooks(); 
        } else {
            UI.showToast(res.message, 'error');
        }
    });

    // 수정 취소
    document.getElementById('btnCancelEdit').addEventListener('click', () => {
        closeEditModal();
    });
});

function closeEditModal() {
    const modal = document.getElementById('editBookModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

function loadDataByTarget(target) {
    switch (target) {
        case 'admin-users':
            loadUsers();
            break;
        case 'admin-books':
            loadAdminBooks();
            break;
        case 'admin-history':
            loadRentalHistory();
            break;
        case 'admin-current-rentals':
            loadCurrentRentals();
            break;
        default:
            break;
    }
}

async function loadAdminBooks() {
    const res = await API.post('getBooks');
    if (res.success) {
        const tbody = document.getElementById('adminBooksTableBody');
        if(!tbody) return;
        
        allBooks = res.data; 
        tbody.innerHTML = '';
        
        allBooks.forEach((b, index) => {
            const isbn = b.ISBN || b.isbn || '-';
            const title = b.도서명 || b.제목 || b.title || '-';
            const category = b.카테고리 || b.분류 || b.category || '-';
            const author = b.저자 || b.작가 || b.author || '-';
            const publisher = b.출판사 || b.publisher || '-';
            const statusText = b.상태 || b.대여상태 || '대여 가능';
            
            const isAvailable = statusText.includes('가능') || statusText === 'AVAILABLE';
            
            // [개선] white-space: nowrap 주입으로 글자 잘림/줄바꿈 방지 및 균등한 min-width 설정
            tbody.innerHTML += `
                <tr>
                    <td style="text-align: center; padding: 12px 10px; white-space: nowrap;">${isbn}</td>
                    <td style="text-align: left; padding: 12px 10px; font-weight: 500;">${title}</td>
                    <td style="text-align: center; padding: 12px 10px; white-space: nowrap; min-width: 90px;">${category}</td>
                    <td style="text-align: center; padding: 12px 10px; white-space: nowrap;">${author}</td>
                    <td style="text-align: center; padding: 12px 10px; white-space: nowrap;">${publisher}</td>
                    <td style="text-align: center; padding: 12px 10px; white-space: nowrap;"><span class="badge ${isAvailable ? 'available' : 'rented'}">${statusText}</span></td>
                    <td style="text-align: center; padding: 12px 10px; white-space: nowrap; min-width: 130px;">
                        <button class="btn-sm btn-outline" style="display:inline-block !important; margin-right:5px; padding: 4px 10px;" onclick="openEditByIndex(${index})">수정</button>
                        <button class="btn-sm btn-danger" style="display:inline-block !important; padding: 4px 10px;" onclick="deleteBook('${isbn}')">삭제</button>
                    </td>
                </tr>`;
        });
        
        const modal = document.getElementById('editBookModal');
        if (modal && !modal.classList.contains('show')) {
            modal.style.display = 'none';
        }
    }
}

function openEditByIndex(index) {
    const book = allBooks[index];
    if (!book) return;

    document.getElementById('editIsbn').value = book.ISBN || book.isbn || '';
    document.getElementById('editTitle').value = book.도서명 || book.제목 || book.title || '';
    document.getElementById('editCategory').value = book.카테고리 || book.분류 || book.category || '';
    document.getElementById('editAuthor').value = book.저자 || book.작가 || book.author || '';
    document.getElementById('editPublisher').value = book.출판사 || book.publisher || '';
    
    const modal = document.getElementById('editBookModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '99999';
    }
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
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${u.아이디 || u.userId || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${u.비밀번호 || u.password || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${u.이름 || u.name || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${u.권한 || u.role || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${u.생성일 || u.createdAt || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${u.전화번호 || u.phone || '-'}</td>
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
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${r.대여ID || r.rentalId || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${r.아이디 || r.userId || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${r.ISBN || r.isbn || '-'}</td>
                <td style="padding: 12px 10px; text-align: left;">${r.도서명 || r.제목 || r.title || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${r.대여일 || r.rentalDate || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${r.반납예정일 || r.dueDate || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;"><span class="badge ${isReturned ? 'available' : 'rented'}">${isReturned ? '반납완료' : '대여중'}</span></td>
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
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        res.data.forEach(r => {
            const dueDateStr = r.반납예정일 || r.dueDate || '';
            let statusBadge = '<span class="badge available">정상</span>';

            if (dueDateStr && dueDateStr !== '-') {
                const dueDate = new Date(dueDateStr);
                dueDate.setHours(0, 0, 0, 0);
                
                if (dueDate < today) {
                    statusBadge = '<span class="badge rented">연체</span>';
                }
            }

            tbody.innerHTML += `<tr>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${r.대여ID || r.rentalId || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${r.아이디 || r.userId || '-'}</td>
                <td style="padding: 12px 10px; text-align: left;">${r.도서명 || r.제목 || r.title || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${r.대여일 || r.rentalDate || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${dueDateStr || '-'}</td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">${statusBadge}</td>
            </tr>`;
        });
    }
}
