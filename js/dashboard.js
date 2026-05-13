let allBooks = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. 사용자 인증 확인
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 2. 상단 사용자 이름 표시
    const displayName = user.이름 || user.name || user.userId || "사용자";
    if (document.getElementById('headerUserName')) {
        document.getElementById('headerUserName').innerText = displayName;
    }

    // 3. 내 정보 수정을 위한 초기값 세팅
    if(document.getElementById('infoUserId')) document.getElementById('infoUserId').value = user.userId || user.아이디 || '';
    if(document.getElementById('infoName')) document.getElementById('infoName').value = displayName;

    // 4. 초기 실행 함수들
    setupTabs();  
    loadBooks();  
    loadMyRentals(); 

    // 5. 로그아웃
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 6. 검색 및 필터 이벤트 연결
    const searchInput = document.getElementById('searchBookInput');
    const catFilter = document.getElementById('filterCategory');
    const pubFilter = document.getElementById('filterPublisher');

    if(searchInput) searchInput.addEventListener('input', applyFilters);
    if(catFilter) catFilter.addEventListener('change', applyFilters);
    if(pubFilter) pubFilter.addEventListener('change', applyFilters);
});

function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-tab');
            if (!targetId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// 필터 옵션을 동적으로 채워주는 함수
function updateFilterOptions(books) {
    const categorySelect = document.getElementById('filterCategory');
    const publisherSelect = document.getElementById('filterPublisher');
    
    if (!categorySelect || !publisherSelect) return;

    // 초기화
    categorySelect.innerHTML = '<option value="">전체 카테고리</option>';
    publisherSelect.innerHTML = '<option value="">전체 출판사</option>';

    // 중복 제거 후 정렬하여 목록 추출
    const categories = [...new Set(books.map(b => b.카테고리 || b.분류).filter(Boolean))].sort();
    const publishers = [...new Set(books.map(b => b.출판사 || b.publisher).filter(Boolean))].sort();

    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        categorySelect.appendChild(opt);
    });

    publishers.forEach(pub => {
        const opt = document.createElement('option');
        opt.value = pub;
        opt.innerText = pub;
        publisherSelect.appendChild(opt);
    });
}

// 검색 + 카테고리 + 출판사 통합 필터링 함수
function applyFilters() {
    const keyword = document.getElementById('searchBookInput').value.toLowerCase();
    const selectedCategory = document.getElementById('filterCategory').value;
    const selectedPublisher = document.getElementById('filterPublisher').value;

    const filtered = allBooks.filter(book => {
        const title = String(book.도서명 || book.제목 || '').toLowerCase();
        const author = String(book.저자 || book.작가 || '').toLowerCase();
        const category = String(book.카테고리 || book.분류 || '');
        const publisher = String(book.출판사 || book.publisher || '');

        const matchKeyword = title.includes(keyword) || author.includes(keyword);
        const matchCategory = selectedCategory === "" || category === selectedCategory;
        const matchPublisher = selectedPublisher === "" || publisher === selectedPublisher;

        return matchKeyword && matchCategory && matchPublisher;
    });

    renderBooks(filtered);
}

async function loadBooks() {
    const res = await API.post('getBooks');
    if (res.success) {
        allBooks = res.data;
        updateFilterOptions(allBooks); // 필터 옵션 업데이트
        renderBooks(allBooks);
    }
}

function renderBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    books.forEach(b => {
        const isbn = b.ISBN || b.isbn || '';
        const title = b.도서명 || b.제목 || '-';
        const category = b.카테고리 || b.분류 || '-';
        const author = b.저자 || b.작가 || '-';
        const publisher = b.출판사 || b.publisher || '-';
        const statusText = b.상태 || b.대여상태 || '정보없음';
        
        // 상태 텍스트에 '가능'이 포함되어 있으면 대여 가능으로 판단
        const isAvailable = statusText.includes('가능') || statusText === 'AVAILABLE';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td title="${title}" style="width: 25%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</td>
            <td style="width: 15%;">${category}</td>
            <td style="width: 20%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${author}</td>
            <td style="width: 20%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${publisher}</td>
            <td style="width: 20%; text-align: center; vertical-align: middle;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span class="badge ${isAvailable ? 'available' : 'rented'}" style="flex-shrink: 0;">
                        ${isAvailable ? '대여가능' : '대여중'}
                    </span>
                    <button class="btn-sm ${isAvailable ? 'btn-primary' : 'btn-outline'}" 
                        ${!isAvailable ? 'disabled' : ''} 
                        onclick="rentBook('${isbn}')" 
                        style="padding: 4px 8px; font-size: 12px; white-space: nowrap;">
                        대여
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/** 대여 하기 **/
async function rentBook(isbn) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.userId || user.아이디 || user.id;

    const book = allBooks.find(b => String(b.ISBN || b.isbn) === String(isbn));
    if (!book) {
        UI.showToast('도서 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    const title = book.도서명 || book.제목;

    if (confirm(`[${title}] 도서를 대여하시겠습니까?`)) {
        const res = await API.post('rentBook', { 
            userId: userId, 
            isbn: isbn,
            title: title 
        });

        if (res.success) {
            UI.showToast('대여 완료!');
            loadBooks();
            loadMyRentals();
        } else {
            UI.showToast(res.message || '대여 실패', 'error');
        }
    }
}

/** 내 대여 목록 로드 **/
async function loadMyRentals() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user.userId || user.아이디 || user.id;
    const res = await API.post('getMyRentals', { userId });
    
    const tbody = document.getElementById('myRentalsTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    if (res.success && res.data) {
        res.data.forEach(r => {
            const tr = document.createElement('tr');
            const rId = r.대여ID || r.rentalId || r[0]; 
            const rIsbn = r.ISBN || r.isbn;

            tr.innerHTML = `
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.도서명 || r.제목}</td>
                <td>${r.대여일 || '-'}</td>
                <td>${r.반납예정일 || '-'}</td>
                <td style="text-align: center;">
                    <button class="btn-sm btn-secondary" onclick="returnBook('${rId}', '${rIsbn}')">반납</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

/** 반납 하기 **/
async function returnBook(rentalId, isbn) {
    if (confirm('반납하시겠습니까?')) {
        const res = await API.post('returnBook', { rentalId, isbn });
        if (res.success) {
            UI.showToast('반납 완료!');
            loadBooks();
            loadMyRentals();
        } else {
            UI.showToast(res.message || '반납에 실패했습니다.', 'error');
        }
    }
}
