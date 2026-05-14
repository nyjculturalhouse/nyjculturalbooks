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

    // 5. 로그아웃 버튼 이벤트 (통일된 UI 스타일 적용을 위해 처리)
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('로그아웃 하시겠습니까?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }

    // 6. 검색 및 필터 이벤트 연결
    const searchInput = document.getElementById('searchBookInput');
    const catFilter = document.getElementById('filterCategory');
    const pubFilter = document.getElementById('filterPublisher');

    if(searchInput) searchInput.addEventListener('input', applyFilters);
    if(catFilter) catFilter.addEventListener('change', applyFilters);
    if(pubFilter) pubFilter.addEventListener('change', applyFilters);

    // 7. 정보 수정 및 회원 탈퇴 이벤트 연결 (3번 요청: 로그인 버튼 스타일 버튼 연결)
    const updateForm = document.getElementById('updateInfoForm');
    if(updateForm) {
        updateForm.addEventListener('submit', updateUserInfo);
    }
    
    const btnWithdraw = document.getElementById('btnWithdraw');
    if(btnWithdraw) {
        btnWithdraw.addEventListener('click', withdrawUser);
    }
});

/** [기능 1] 탭 전환 제어 (2번 요청: 버튼을 눌러야 섹션이 보이도록 수정) **/
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section'); // HTML 섹션들의 클래스
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-tab');
            if (!targetId) return;

            // 메뉴 활성화 상태 변경
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 섹션 전환: 모든 섹션 숨기고 선택된 섹션만 표시
            sections.forEach(section => {
                section.style.display = 'none'; // 일단 모두 숨김
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.style.display = 'block'; // 해당 섹션만 표시
                    section.classList.add('active');
                }
            });
            
            // 상단 타이틀 변경
            const titleMap = {
                'view-home': '홈',
                'view-rent-book': '도서 대여',
                'view-my-rentals': '대여 정보 조회/반납',
                'view-my-info': '내 정보'
            };
            if(pageTitle) pageTitle.innerText = titleMap[targetId] || '홈';

            // 데이터 최신화
            if (targetId === 'view-my-rentals') loadMyRentals();
            if (targetId === 'view-rent-book') loadBooks();
        });
    });

    // 초기 상태 설정: 홈 섹션만 보이기
    const firstTab = document.querySelector('.nav-item[data-tab="view-home"]');
    if (firstTab) firstTab.click();
}

/** [기능 2] 정보 수정 및 탈퇴 (3번 요청: 로그인 버튼과 동일한 UI 스타일의 버튼 사용) **/
async function updateUserInfo(e) {
    e.preventDefault();
    const userId = document.getElementById('infoUserId').value;
    const newName = document.getElementById('infoName').value;
    const newPassword = document.getElementById('infoPassword').value;

    if (confirm("정보를 수정하시겠습니까?")) {
        UI.showToast('처리 중...', 'info');
        const res = await API.post('updateUserInfo', { userId, name: newName, password: newPassword });

        if (res.success) {
            UI.showToast('정보가 수정되었습니다.');
            const user = JSON.parse(localStorage.getItem('currentUser'));
            user.이름 = newName;
            localStorage.setItem('currentUser', JSON.stringify(user));
            if(document.getElementById('headerUserName')) {
                document.getElementById('headerUserName').innerText = newName;
            }
        } else {
            UI.showToast(res.message || '수정 실패', 'error');
        }
    }
}

async function withdrawUser() {
    if (confirm("정말로 탈퇴하시겠습니까? 모든 대여 기록이 삭제됩니다.")) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const res = await API.post('withdrawUser', { userId: user.userId || user.아이디 });
        
        if (res.success) {
            alert("회원 탈퇴가 완료되었습니다.");
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        } else {
            UI.showToast(res.message || "탈퇴 처리 중 오류 발생", "error");
        }
    }
}

/** [기능 3] 도서 데이터 로드 및 렌더링 (1번 요청: 버튼 UI 통일) **/
function renderBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = books.map(b => {
        const isbn = b.ISBN || b.isbn || '';
        const statusText = String(b.상태 || b.대여상태 || '가능');
        const isAvail = statusText.includes('가능') || statusText.toUpperCase() === 'AVAILABLE';

        // 1번 요청 반영: 로그인 버튼과 같은 스타일의 클래스(btn-primary) 적용
        return `
            <tr>
                <td><strong>${b.도서명 || b.제목}</strong></td>
                <td>${b.카테고리 || b.분류 || '-'}</td>
                <td>${b.저자 || b.작가 || '-'}</td>
                <td>${b.출판사 || b.publisher || '-'}</td>
                <td style="text-align: center;">
                    <div class="status-action-cell">
                        <span class="badge ${isAvail ? 'available' : 'rented'}">${isAvail ? '대여가능' : '대여중'}</span>
                        <button class="btn-primary ${!isAvail ? 'btn-disabled' : ''}" 
                                style="width: 70px; height: 35px; font-size: 13px; margin: 0; padding: 0;"
                                ${!isAvail ? 'disabled' : ''} onclick="rentBook('${isbn}')">대여</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/** [기능 4] 대여 및 반납 로직 (1번 요청: 버튼 UI 통일) **/
async function loadMyRentals() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const res = await API.post('getMyRentals', { userId: user.userId || user.아이디 });
    const tbody = document.getElementById('myRentalsTableBody');
    if(!tbody) return;

    if (res.success && res.data.length > 0) {
        tbody.innerHTML = res.data.reverse().map(r => {
            const isReturned = String(r.반납여부 || "").trim().toUpperCase() === 'Y';
            const rId = r.대여ID || r.rentalId || r[0];
            // 1번 요청 반영: 반납 버튼도 btn-primary 스타일 적용 (반납 버튼은 보조색을 위해 btn-secondary 클래스 유지하되 스타일은 통일)
            return `
                <tr style="${isReturned ? 'color:#adb5bd; background:#f8f9fa;' : ''}">
                    <td>${r.도서명 || r.제목}</td>
                    <td>${r.대여일 || '-'}</td>
                    <td>${r.반납예정일 || '-'}</td>
                    <td style="text-align: center;">
                        ${isReturned ? '<b>반납완료</b>' : `<button class="btn-primary" style="width: 70px; height: 35px; font-size: 13px; margin: 0; padding: 0;" onclick="returnBook('${rId}', '${r.ISBN || r.isbn}')">반납</button>`}
                    </td>
                </tr>
            `;
        }).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#999;">대여 기록이 없습니다.</td></tr>';
    }
}

// 아래 기존 필터 및 렌더링 로직(loadBooks, renderNewBooks, renderPopularBooks, applyFilters 등)은 기존 코드와 동일하게 유지됨
async function loadBooks() {
    try {
        const res = await API.post('getBooks');
        const rentalRes = await API.post('getRentalHistory'); 
        if (res.success) {
            allBooks = res.data;
            updateFilterOptions(allBooks);
            renderBooks(allBooks);
            renderNewBooks(allBooks);
            const popularList = document.getElementById('popularBooksList');
            if (rentalRes.success && rentalRes.data && popularList) {
                renderPopularBooks(allBooks, rentalRes.data);
            }
        }
    } catch (error) { console.error("데이터 로드 오류:", error); }
}

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
            <span style="color: #888; font-size: 12px;">${b.저자 || '-'}</span>
        </div>
    `).join('');
}

function renderPopularBooks(books, history) {
    const list = document.getElementById('popularBooksList');
    if(!list) return;
    const counts = {};
    history.forEach(record => {
        const title = record.도서명 || record.제목 || record[1];
        if (title) counts[title] = (counts[title] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    list.innerHTML = sorted.map((item, i) => `
        <div class="ranking-item">
            <div style="display: flex; align-items: center;">
                <span class="rank-badge">${i+1}</span>
                <span style="font-weight: 500;">${item[0]}</span>
            </div>
            <span style="color: #f04452; font-weight: 600; font-size: 12px;">${item[1]}회 대여</span>
        </div>
    `).join('');
}

async function rentBook(isbn) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const book = allBooks.find(b => String(b.ISBN || b.isbn) === String(isbn));
    if (!book) return;
    if (confirm(`[${book.도서명 || book.제목}] 도서를 대여하시겠습니까?`)) {
        const res = await API.post('rentBook', { userId: user.userId || user.아이디, isbn, title: book.도서명 || book.제목 });
        if (res.success) { UI.showToast('대여 완료!'); loadBooks(); loadMyRentals(); }
    }
}

async function returnBook(rentalId, isbn) {
    if (confirm('반납하시겠습니까?')) {
        const res = await API.post('returnBook', { rentalId, isbn });
        if (res.success) { UI.showToast('반납 완료!'); loadBooks(); loadMyRentals(); }
    }
}

function updateFilterOptions(books) {
    const categorySelect = document.getElementById('filterCategory');
    const publisherSelect = document.getElementById('filterPublisher');
    if (!categorySelect || !publisherSelect) return;
    categorySelect.innerHTML = '<option value="">전체 카테고리</option>';
    publisherSelect.innerHTML = '<option value="">전체 출판사</option>';
    [...new Set(books.map(b => b.카테고리 || b.분류).filter(Boolean))].sort().forEach(cat => {
        const opt = document.createElement('option'); opt.value = cat; opt.innerText = cat; categorySelect.appendChild(opt);
    });
    [...new Set(books.map(b => b.출판사 || b.publisher).filter(Boolean))].sort().forEach(pub => {
        const opt = document.createElement('option'); opt.value = pub; opt.innerText = pub; publisherSelect.appendChild(opt);
    });
}

function applyFilters() {
    const keyword = document.getElementById('searchBookInput').value.toLowerCase();
    const selectedCategory = document.getElementById('filterCategory').value;
    const selectedPublisher = document.getElementById('filterPublisher').value;
    const filtered = allBooks.filter(book => {
        const matchKeyword = (book.도서명 || book.제목 || '').toLowerCase().includes(keyword) || (book.저자 || book.작가 || '').toLowerCase().includes(keyword);
        const matchCategory = selectedCategory === "" || (book.카테고리 || book.분류) === selectedCategory;
        const matchPublisher = selectedPublisher === "" || (book.출판사 || book.publisher) === selectedPublisher;
        return matchKeyword && matchCategory && matchPublisher;
    });
    renderBooks(filtered);
}
