document.addEventListener('DOMContentLoaded', async () => {
    await loadBooks();

    const btnSearch = document.getElementById('btnSearch');
    const searchKeyword = document.getElementById('searchKeyword');

    if (btnSearch) btnSearch.addEventListener('click', handleSearch);
    if (searchKeyword) {
        searchKeyword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
});

async function loadBooks() {
    const container = document.getElementById('bookListContainer');
    if (!container) return;

    const response = await API.getBooks();
    if (response && response.success && Array.isArray(response.data)) {
        window.allBooksData = response.data;
        renderBookList(window.allBooksData);
    } else {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-[#FF5A36]">데이터 로드 실패</div>`;
    }
}

function renderBookList(books) {
    const container = document.getElementById('bookListContainer');
    if (!container) return;

    if (books.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-[#8C8276]">결과 없음</div>`;
        return;
    }

    container.innerHTML = books.map(book => {
        const isAvailable = (String(book.상태).trim() === '대여가능');
        return `
            <div class="bg-white border border-outline-variant p-5 rounded-xl">
                <h3 class="text-primary font-medium mb-1">${book.도서명}</h3>
                <div class="text-xs text-on-surface-variant mb-4">${book.저자}</div>
                <div class="flex items-center justify-between">
                    <span class="text-xs ${isAvailable ? 'text-blue-500' : 'text-red-500'}">
                        ${isAvailable ? '● 대여 가능' : '■ 대여 중'}
                    </span>
                    <button class="bg-primary text-white text-xs px-3 py-1.5 rounded-lg" 
                            ${isAvailable ? '' : 'disabled'} 
                            onclick="rentBook('${book.ISBN}', '${book.도서명.replace(/'/g, "\\'")}')">
                        ${isAvailable ? '대여하기' : '대여불가'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function handleSearch() {
    const category = document.getElementById('searchCategory').value;
    const keyword = document.getElementById('searchKeyword').value.trim().toLowerCase();
    if (!window.allBooksData) return;

    const filtered = window.allBooksData.filter(book => {
        if (!keyword) return true;
        const target = (category === 'title') ? book.도서명 : (category === 'author') ? book.저자 : (book.도서명 + book.저자);
        return target.toLowerCase().includes(keyword);
    });
    renderBookList(filtered);
}

async function rentBook(isbn, bookTitle) {
    if (!confirm(`[${bookTitle}]을 대여하시겠습니까?`)) return;
    const book = window.allBooksData.find(b => b.ISBN === isbn);
    const response = await API.rentBook(book);
    
    if (response && response.success) {
        alert('대여 완료!');
        location.reload(); // 리스트 업데이트
    } else {
        alert(response.message || '대여 실패');
    }
}
