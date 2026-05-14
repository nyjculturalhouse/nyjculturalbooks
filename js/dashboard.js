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

    // 5. 로그아웃 버튼 이벤트 (2번 요청: 빨간색 및 정보수정 UI와 통일)
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

    // 7. 정보 수정 및 회원 탈퇴 이벤트 연결
    const updateForm = document.getElementById('updateInfoForm');
    if(updateForm) {
        updateForm.addEventListener('submit', updateUserInfo);
    }
    
    const btnWithdraw = document.getElementById('btnWithdraw');
    if(btnWithdraw) {
        btnWithdraw.addEventListener('click', withdrawUser);
    }
});

/** [기능 1] 탭 전환 제어 **/
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-tab');
            if (!targetId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.style.display = 'block';
                    section.classList.add('active');
                }
            });
            
            const titleMap = {
                'view-home': '홈',
                'view-rent-book': '도서 대여',
                'view-my-rentals': '대여 정보 조회/반납',
                'view-my-info': '내 정보'
            };
            if(pageTitle) pageTitle.innerText = titleMap[targetId] || '홈';

            if (targetId === 'view-my-rentals') loadMyRentals();
            if (targetId === 'view-rent-book') loadBooks();
        });
    });

    const firstTab = document.querySelector('.nav-item[data-tab="view-home"]');
    if (firstTab) firstTab.click();
}

/** [기능 2] 정보 수정 및 탈퇴 **/
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

/** [기능 3] 도서 데이터 로드 및 렌더링 (4번 요청: 말줄임표 및 정렬 반영) **/
function renderBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = books.map(b => {
        const isbn = b.ISBN || b.isbn || '';
        const statusText = String(b.상태 || b.대여상태 || '가능');
        const isAvail = statusText.includes('가능') || statusText.toUpperCase() === 'AVAILABLE';

        return `
            <tr>
                <td title="${b.도서명 || b.제목}" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <strong>${b.도서명 || b.제목}</strong>
                </td>
                <td style="white-space: nowrap;">${b.카테고리 || b.분류 || '-'}</td>
                <td style="text-align: center; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${b.저자 || b.작가 || '-'}">
                    ${b.저자 || b.작가 || '-'}
                </td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.출판사 || b.publisher || '-'}</td>
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

/** [기능 4] 대여 및 반납 로직 (3번 요청: 대여 기록 없을 때 간격 해결) **/
async function loadMyRentals() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const res = await API.post('getMyRentals', { userId: user.userId || user.아이디 });
    const tbody = document.getElementById('myRentalsTableBody');
    if(!tbody) return;

    if (res.success && res.data.length > 0) {
        tbody.innerHTML = res.data.reverse().map(r => {
            const isReturned = String(r.반납여부 || "").trim().toUpperCase() === 'Y';
            const rId = r.대여ID || r.rentalId || r[0];
            return `
                <tr style="${isReturned ? 'color:#adb5bd; background:#f8f9fa;' : ''}">
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r.도서명 || r.제목}</td>
                    <td>${r.대여일 || '-'}</td>
                    <td>${r.반납예정일 || '-'}</td>
                    <td style="text-align: center;">
                        ${isReturned ? '<b>반납완료</b>' : `<button class="btn-primary" style="width: 70px; height: 35px; font-size: 13px; margin: 0; padding: 0;" onclick="returnBook('${rId}', '${r.ISBN || r.isbn}')">반납</button>`}
                    </td>
                </tr>
            `;
        }).join('');
    } else {
        // 3번 요청 반영: 패딩을 주어 헤더와 붙지 않게 처리
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:100px 0; color:#999;">대여 기록이 없습니다.</td></tr>';
    }
}

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

/** 6번 요청: NEW 배지를 정보수정 UI 스타일로 변경 **/
function renderNewBooks(books) {
    const list = document.getElementById('newBooksList');
    if(!list) return;
    const newBooks = [...books].reverse().slice(0, 3);
    list.innerHTML = newBooks.map(b => `
        <div class="ranking-item" style="margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="background-color: #1890ff; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">NEW</span> 
                <span style="font-weight: 500; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b.도서명 || b.제목}</span>
            </div>
            <div style="color: #888; font-size: 12px; margin-top: 4px; padding-left: 55px;">${b.저자 || '-'}</div>
        </div>
    `).join('');
}

/** 6번 요청: 2회 대여 배지를 정보수정 UI 스타일로 변경 (빨간색 유지) **/
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
        <div class="ranking-item" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="rank-badge">${i+1}</span>
                <span style="font-weight: 500; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item[0]}</span>
            </div>
            <span style="border: 1px solid #f04452; color: #f04452; padding: 3px 10px; border-radius: 20px; font-weight: 600; font-size: 11px;">${item[1]}회 대여</span>
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
        const matchCategory = selectedCategory === "" || (book.카테고리 || b.분류) === selectedCategory;
        const matchPublisher = selectedPublisher === "" || (book.출판사 || b.publisher) === selectedPublisher;
        return matchKeyword && matchCategory && matchPublisher;
    });
    renderBooks(filtered);
}
