// 도서 대여 페이지 전용 스크립트
document.addEventListener('DOMContentLoaded', async () => {
    console.log("도서 대여 페이지 초기화 시작...");
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

    try {
        const response = await API.getBooks();
        // 콘솔에서 데이터 구조 확인용
        console.log("서버 응답 데이터:", response); 

        if (response && response.success && Array.isArray(response.data)) {
            window.allBooksData = response.data; 
            renderBookList(window.allBooksData);
        } else {
            container.innerHTML = `<div class="col-span-full text-center py-12 text-[#FF5A36]">데이터를 불러올 수 없습니다.</div>`;
        }
    } catch (error) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-[#FF5A36]">서버 통신 오류가 발생했습니다.</div>`;
    }
}

function renderBookList(books) {
    const container = document.getElementById('bookListContainer');
    if (!container) return;

    if (books.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-[#8C8276]">검색 결과가 없습니다.</div>`;
        return;
    }

    container.innerHTML = books.map(book => {
        const isAvailable = (String(book.상태).trim() === '대여가능');
        return `
            <div class="bg-white border border-outline-variant p-5 rounded-xl shadow-sm">
                <h3 class="text-primary font-medium mb-1">${book.도서명}</h3>
                <div class="text-xs text-on-surface-variant mb-4">${book.저자} | ${book.출판사 || '소소출판'}</div>
                <div class="flex items-center justify-between">
                    <span class="text-xs ${isAvailable ? 'text-blue-500' : 'text-red-500'}">
                        ${isAvailable ? '● 대여 가능' : '■ 대여 중'}
                    </span>
                    <button class="bg-primary text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50" 
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

    const filteredBooks = window.allBooksData.filter(book => {
        if (!keyword) return true;
        const titleMatch = book.도서명.toLowerCase().includes(keyword);
        const authorMatch = book.저자.toLowerCase().includes(keyword);
        
        if (category === 'title') return titleMatch;
        if (category === 'author') return authorMatch;
        return titleMatch || authorMatch;
    });

    renderBookList(filteredBooks);
}

async function rentBook(isbn, bookTitle) {
    if (!confirm(`[${bookTitle}] 도서를 대여하시겠습니까?`)) return;

    const book = window.allBooksData.find(b => b.ISBN === isbn);
    const response = await API.rentBook(book);
    
    if (response && response.success) {
        alert('대여 완료!');
        await loadBooks(); 
    } else {
        alert(response.message || '대여 실패');
    }
}
