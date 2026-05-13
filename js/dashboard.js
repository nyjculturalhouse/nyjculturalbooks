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
            
            // 페이지 타이틀 변경 (가독성용)
            const titleMap = {
                'view-home': '홈',
                'view-rent-book': '도서 대여',
                'view-my-rentals': '대여 정보 조회/반납',
                'view-my-info': '내 정보'
            };
            if(document.getElementById('pageTitle')) {
                document.getElementById('pageTitle').innerText = titleMap[targetId] || '홈';
            }
        });
    });
}

// 필터 옵션을 동적으로 채워주는 함수
function updateFilterOptions(books) {
    const categorySelect = document.getElementById('filterCategory');
    const publisherSelect = document.getElementById('filterPublisher');
    
    if (!categorySelect || !publisherSelect) return;

    categorySelect.innerHTML = '<option value="">전체 카테고리</option>';
    publisherSelect.innerHTML = '<option value="">전체 출판사</option>';

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
    try {
        const res = await API.post('getBooks');
        // 중요: 인기 도서는 '내 대여'가 아닌 '전체 대여 이력'을 가져와야 합니다.
        const rentalRes = await API.post('getRentalHistory'); 

        if (res.success) {
            allBooks = res.data;
            updateFilterOptions(allBooks);
            renderBooks(allBooks);
            renderNewBooks(allBooks);
            
            // 인기 도서 렌더링 (전체 이력 데이터가 있을 때만)
            if (rentalRes.success && rentalRes.data) {
                renderPopularBooks(allBooks, rentalRes.data);
            } else {
                document.getElementById('popularBooksList').innerHTML = '<p class="empty-text">대여 기록이 없습니다.</p>';
            }
        }
    } catch (error) {
        console.error("데이터 로드 중 오류:", error);
    }
}

// 신간 도서 렌더링
function renderNewBooks(books) {
    const list = document.getElementById('newBooksList');
    if(!list) return;
    const newBooks = [...books].reverse().slice(0, 3);
    
    list.innerHTML = newBooks.map(b => `
        <div class="ranking-item">
            <div style="display: flex; align-items: center;">
                <span class="rank-badge new">NEW</span> 
                <span style="font-weight: 500;">${b.도서명 || b.제목}</span>
            </div>
            <span style="color: #888; font-size: 12px;">${b.저자}</span>
        </div>
    `).join('');
}

// 인기 도서 렌더링 (카운트 로직 복구 및 보완)
function renderPopularBooks(books, history) {
    const list = document.getElementById('popularBooksList');
    if(!list) return;

    if (!history || history.length === 0) {
        list.innerHTML = '<p class="empty-text">데이터가 없습니다.</p>';
        return;
    }

    // 1. 도서명별 대여 횟수 계산
    const counts = {};
    history.forEach(record => {
        const title = record.도서명 || record.제목 || record[1]; // 시트 구조에 따라 조정
        if (title) {
            counts[title] = (counts[title] || 0) + 1;
        }
    });

    // 2. 정렬 후 상위 5개 추출
    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (sorted.length === 0) {
        list.innerHTML = '<p class="empty-text">인기 도서 집계 중...</p>';
        return;
    }

    // 3. HTML 출력
    list.innerHTML = sorted.map((item, i) => {
        // 전체 도서 목록에서 해당 도서의 저자 정보를 찾아 표시 (선택 사항)
        const bookInfo = books.find(b => (b.도서명 || b.제목) === item[0]);
        const author = bookInfo ? bookInfo.저자 : "";

        return `
            <div class="ranking-item">
                <div style="display: flex; align-items: center;">
                    <span class="rank-badge">${i+1}</span>
                    <span style="font-weight: 500;">${item[0]}</span>
                </div>
                <span style="color: var(--danger); font-weight: 600; font-size: 12px;">${item[1]}회 대여</span>
            </div>
        `;
    }).join('');
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
        const statusText = String(b.상태 || b.대여상태 || '가능');
        
        const isAvailable = statusText.includes('가능') || statusText.toUpperCase() === 'AVAILABLE';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td title="${title}">${title}</td>
            <td>${category}</td>
            <td title="${author}">${author}</td>
            <td title="${publisher}">${publisher}</td>
            <td>
                <div class="status-action-cell">
                    <span class="badge ${isAvailable ? 'available' : 'rented'}">
                        ${isAvailable ? '가능' : '불가'}
                    </span>
                    <button class="btn-sm ${isAvailable ? 'btn-primary' : 'btn-outline'}" 
                        ${!isAvailable ? 'disabled' : ''} 
                        onclick="rentBook('${isbn}')">
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
            loadBooks(); // 대시보드와 목록 갱신
            loadMyRentals();
        } else {
            UI.showToast(res.message || '대여 실패', 'error');
        }
    }
}

/** 내 대여 목록 로드 **/
async function loadMyRentals() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(!user) return;
    
    const userId = user.userId || user.아이디 || user.id;
    const res = await API.post('getMyRentals', { userId });
    
    const tbody = document.getElementById('myRentalsTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    if (res.success && res.data) {
        const sortedData = [...res.data].reverse();

        sortedData.forEach(r => {
            const tr = document.createElement('tr');
            const rId = r.대여ID || r.rentalId || r[0]; 
            const rIsbn = r.ISBN || r.isbn;
            const isReturned = String(r.반납여부 || "").trim().toUpperCase() === 'Y';

            tr.innerHTML = `
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.도서명 || r.제목}</td>
                <td>${r.대여일 || '-'}</td>
                <td>${r.반납예정일 || '-'}</td>
                <td style="text-align: center;">
                    ${isReturned 
                        ? `<span style="color: #999; font-weight: bold;">반납완료</span>` 
                        : `<button class="btn-sm btn-secondary" onclick="returnBook('${rId}', '${rIsbn}')">반납</button>`
                    }
                </td>
            `;
            
            if (isReturned) {
                tr.style.backgroundColor = '#f8f9fa';
                tr.style.color = '#adb5bd';
            }
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px; color:#999;">대여 중인 도서가 없습니다.</td></tr>';
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
