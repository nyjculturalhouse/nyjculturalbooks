let allBooks = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. 사용자 인증 확인
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 2. 상단 사용자 이름 표시 (모든 키값 대응)
    const displayName = user.이름 || user.name || user.userId || "사용자";
    if (document.getElementById('headerUserName')) {
        document.getElementById('headerUserName').innerText = displayName;
    }

    // 3. 내 정보 수정을 위한 초기값 세팅
    if(document.getElementById('infoUserId')) document.getElementById('infoUserId').value = user.userId || user.아이디 || '';
    if(document.getElementById('infoName')) document.getElementById('infoName').value = displayName;

    // 4. 초기 실행 함수들
    setupTabs();  // 탭 클릭 기능 활성화
    loadBooks();  // 도서 목록 로드
    loadMyRentals(); // 내 대여 현황 로드

    // 5. 로그아웃
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // 6. 도서 검색
    document.getElementById('searchBookInput').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = allBooks.filter(b => {
            const title = String(b.도서명 || b.제목 || '').toLowerCase();
            const author = String(b.저자 || b.작가 || '').toLowerCase();
            return title.includes(keyword) || author.includes(keyword);
        });
        renderBooks(filtered);
    });
});

/** 탭 클릭 전환 함수 (내 정보 클릭 해결) **/
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-tab');
            if (!targetId) return;

            // 메뉴 활성화 상태 변경
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 섹션 화면 전환
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

/** 도서 목록 가져오기 **/
async function loadBooks() {
    const res = await API.post('getBooks');
    if (res.success) {
        allBooks = res.data;
        renderBooks(allBooks);
    }
}

/** 도서 목록 렌더링 (image_54b242.png 출판사 포함 버전) **/
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
        const isAvailable = statusText.includes('가능') || statusText === 'AVAILABLE';

        const tr = document.createElement('tr');
        // '상태'와 '버튼'을 한 칸(td)에 넣어 레이아웃을 고정합니다.
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
    if (confirm(`도서를 대여하시겠습니까?`)) {
        const res = await API.post('rentBook', { userId, isbn });
        if (res.success) {
            UI.showToast('대여 완료!');
            loadBooks();
            loadMyRentals();
        } else {
            UI.showToast(res.message, 'error');
        }
    }
}

/** 내 대여 현황 가져오기 **/
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
            tr.innerHTML = `
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.도서명 || r.제목}</td>
                <td>${r.대여일 ? new Date(r.대여일).toLocaleDateString() : '-'}</td>
                <td>${r.반납예정일 ? new Date(r.반납예정일).toLocaleDateString() : '-'}</td>
                <td style="text-align: center;">
                    <button class="btn-sm btn-secondary" onclick="returnBook('${r.대여ID || r.rentalId}', '${r.ISBN || r.isbn}')">반납</button>
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
        }
    }
}
