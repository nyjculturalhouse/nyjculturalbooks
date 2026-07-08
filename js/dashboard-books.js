let allBooks = [];

/** [도서 관련 기능] **/
function renderBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    tbody.innerHTML = books.map(b => {
        const isbn = b.ISBN || b.isbn || '';
        const statusText = String(b.상태 || b.대여상태 || '가능');
        const isAvail = statusText.includes('가능') || statusText.toUpperCase() === 'AVAILABLE';
        const dueDate = b.반납예정일 || b.dueDate || '';
        return `<tr>
            <td class="title" title="${b.도서명 || b.제목}"><strong>${b.도서명 || b.제목}</strong></td>
            <td>${b.카테고리 || b.분류 || '-'}</td>
            <td title="${b.저자 || b.작가 || '-'}">${b.저자 || b.작가 || '-'}</td>
            <td title="${b.출판사 || b.publisher || '-'}">${b.출판사 || b.publisher || '-'}</td>
            <td>
                ${!isAvail && dueDate ? `<div style="font-size:12px; color:var(--danger); font-weight:700; margin-bottom:6px; white-space:nowrap;">반납일 ${dueDate}</div>` : ''}
                <button class="btn-rent ${!isAvail ? 'rented' : ''}" ${!isAvail ? 'disabled' : ''} onclick="rentBook('${isbn}')">${isAvail ? '대여' : '대여중'}</button>
            </td>
        </tr>`;
    }).join('');
}

async function loadBooks() {
    try {
        const res = await API.post('getBooks');
        const rentalRes = await API.post('getRentalHistory');
        if (res.success) {
            let rentalMap = {};
            if (rentalRes.success && rentalRes.data) {
                rentalRes.data.forEach(r => {
                    const isReturned = String(r.반납여부 || '').trim().toUpperCase() === 'Y';
                    if (!isReturned) {
                        const isbn = String(r.ISBN || r.isbn || r[2] || '').trim();
                        rentalMap[isbn] = { dueDate: r.반납예정일 || r.dueDate || r[5] || '' };
                    }
                });
            }
            allBooks = res.data.map(book => {
                const isbn = String(book.ISBN || book.isbn || '').trim();
                return { ...book, 반납예정일: rentalMap[isbn] ? rentalMap[isbn].dueDate : '' };
            }).sort((a, b) => String(a.도서명 || a.제목 || '').localeCompare(String(b.도서명 || b.제목 || ''), 'ko'));
            updateFilterOptions(allBooks);
            renderBooks(allBooks);
            renderNewBooks(res.data);
            if (rentalRes.success && rentalRes.data) renderPopularBooks(allBooks, rentalRes.data);
        }
    } catch (error) { console.error("데이터 로드 오류:", error); }
}

function renderNewBooks(books) {
    const list = document.getElementById('newBooksList');
    if (!list) return;
    const newBooks = [...books].slice(-3).reverse();
    list.innerHTML = newBooks.map(b => `<div class="ranking-item"><div style="display:flex; align-items:center; gap:8px;"><span class="new-badge">NEW</span><span class="new-book-title" style="font-weight:600;">${b.도서명 || b.제목}</span></div><div style="color:var(--text-light); font-size:13px; margin-top:4px; padding-left:50px;">${b.저자 || '-'}</div></div>`).join('');
}

function renderPopularBooks(books, history) {
    const list = document.getElementById('popularBooksList');
    if (!list) return;
    const counts = {};
    history.forEach(r => { const t = r.도서명 || r.제목 || r[1]; if (t) counts[t] = (counts[t] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    list.innerHTML = sorted.map((item, i) => `<div class="ranking-item" style="display:flex; justify-content:space-between; align-items:center;"><div style="display:flex; align-items:center; gap:10px;"><span class="rank-badge" style="background:var(--bg-color); padding:2px 8px; border-radius:6px; font-size:12px; font-weight:700;">${i + 1}</span><span style="font-weight:600; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item[0]}</span></div><span class="rent-count-badge">${item[1]}회 대여</span></div>`).join('');
}

async function rentBook(isbn) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const book = allBooks.find(b => String(b.ISBN || b.isbn) === String(isbn));
    if (!book) return;
    const res = await API.post('rentBook', { userId: user.userId || user.아이디, isbn, title: book.도서명 || book.제목 });
    if (res.success) { UI.showToast('대여 완료!'); loadBooks(); loadMyRentals(); }
}

async function returnBook(rentalId, isbn) {
    const today = new Date();
    const returnDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const res = await API.post('returnBook', { rentalId, isbn, returnDate });
    if (res.success) { UI.showToast('반납 완료!'); loadBooks(); loadMyRentals(); }
}

async function deleteRental(rentalId, isbn) {
    if (!confirm('대여 기록을 삭제하시겠습니까?')) return;
    const res = await API.post('deleteRental', { rentalId, isbn });
    if (res.success) { UI.showToast('삭제 완료!'); loadBooks(); loadMyRentals(); }
}

function updateFilterOptions(books) {
    const catSelect = document.getElementById('filterCategory');
    const pubSelect = document.getElementById('filterPublisher');
    if (!catSelect || !pubSelect) return;
    catSelect.innerHTML = '<option value="">전체 카테고리</option>';
    pubSelect.innerHTML = '<option value="">전체 출판사</option>';
    [...new Set(books.map(b => b.카테고리 || b.분류).filter(Boolean))].sort().forEach(cat => {
        const opt = document.createElement('option'); opt.value = cat; opt.innerText = cat; catSelect.appendChild(opt);
    });
    [...new Set(books.map(b => b.출판사 || b.publisher).filter(Boolean))].sort().forEach(pub => {
        const opt = document.createElement('option'); opt.value = pub; opt.innerText = pub; pubSelect.appendChild(opt);
    });
}

function applyFilters() {
    const keyword = document.getElementById('searchBookInput').value.toLowerCase();
    const selectedCategory = document.getElementById('filterCategory').value;
    const selectedPublisher = document.getElementById('filterPublisher').value;
    const filtered = allBooks.filter(book => {
        const title = (book.도서명 || book.제목 || '').toLowerCase();
        const author = (book.저자 || book.작가 || '').toLowerCase();
        const category = book.카테고리 || book.분류 || '';
        const publisher = book.출판사 || book.publisher || '';
        return (title.includes(keyword) || author.includes(keyword)) && (selectedCategory === "" || category === selectedCategory) && (selectedPublisher === "" || publisher === selectedPublisher);
    });
    renderBooks(filtered);
}
