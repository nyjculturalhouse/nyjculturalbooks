let allBooks = [];

document.addEventListener('DOMContentLoaded', () => {
    const user = typeof checkAuth === 'function' ? checkAuth(false) : JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 이름 표시 보강: '이름'이나 'name' 키값이 없을 경우를 대비해 'userId' 등 모든 가능성 체크
    const displayUserId = user.아이디 || user.userId || user.id || 'Unknown';
    const displayName = user.이름 || user.name || user.displayName || displayUserId;

    const nameElement = document.getElementById('headerUserName');
    if (nameElement) nameElement.innerText = displayName;
    
    if(document.getElementById('infoUserId')) document.getElementById('infoUserId').value = displayUserId;
    if(document.getElementById('infoName')) document.getElementById('infoName').value = displayName;

    if (typeof setupTabs === 'function') setupTabs();
    loadBooks();
    loadMyRentals();

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    document.getElementById('searchBookInput').addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = allBooks.filter(b => {
            const title = String(b.도서명 || b.제목 || b.title || '').toLowerCase();
            const author = String(b.저자 || b.작가 || b.author || '').toLowerCase();
            return title.includes(keyword) || author.includes(keyword);
        });
        renderBooks(filtered);
    });
});

async function loadBooks() {
    try {
        const res = await API.post('getBooks');
        if (res.success) {
            allBooks = res.data;
            renderBooks(allBooks);
        }
    } catch (err) {
        console.error("도서 로드 실패:", err);
    }
}

// image_55093a.png의 헤더 순서(도서명, 카테고리, 저자, 출판사, 상태)에 맞게 수정
function renderBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    books.forEach(b => {
        const isbn = b.ISBN || b.isbn || '-';
        const title = b.도서명 || b.제목 || b.title || '-';
        const category = b.카테고리 || b.분류 || b.category || '-';
        const author = b.저자 || b.작가 || b.author || '-';
        const publisher = b.출판사 || b.publisher || '-'; // 출판사 데이터 복구
        const statusText = b.상태 || b.대여상태 || '정보없음';
        const isAvailable = statusText.includes('가능') || statusText === 'AVAILABLE';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td title="${title}" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</td>
            <td style="white-space: nowrap;">${category}</td>
            <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${author}</td>
            <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${publisher}</td>
            <td style="text-align: center;">
                <span class="badge ${isAvailable ? 'available' : 'rented'}">${isAvailable ? '대여가능' : '대여중'}</span>
            </td>
            <td style="text-align: center;">
                <button class="btn-sm ${isAvailable ? 'btn-primary' : 'btn-outline'}" 
                ${!isAvailable ? 'disabled' : ''} onclick="rentBook('${isbn}')">대여</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ... (rentBook, loadMyRentals, returnBook 함수는 이전과 동일)
