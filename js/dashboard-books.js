// 도서 대여 페이지 (rent-books.html) 전용 스크립트
document.addEventListener('DOMContentLoaded', async () => {
    console.log("도서 대여 페이지 초기화 시작...");
    
    // 1. 초기 도서 데이터 로드
    await loadBooks();

    // 2. 검색 버튼 클릭 이벤트 바인딩
    const btnSearch = document.getElementById('btnSearch');
    const searchKeyword = document.getElementById('searchKeyword');

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            handleSearch();
        });
    }

    // 엔터키 검색 이벤트 바인딩
    if (searchKeyword) {
        searchKeyword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
});

// 도서 목록을 API로부터 로드하고 화면에 렌더링하는 함수
async function loadBooks() {
    const container = document.getElementById('bookListContainer');
    if (!container) return;

    try {
        // API로부터 전체 도서 목록 가져오기
        const response = await API.getBooks();
        
        if (response && response.success && Array.isArray(response.data)) {
            window.allBooksData = response.data; // 검색 필터링을 위해 전역 변수에 저장
            renderBookList(response.data);
        } else {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #FF5A36; padding: 40px 0;">도서 데이터를 불러오지 못했습니다.</div>`;
        }
    } catch (error) {
        console.error("데이터 로드 오류:", error);
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #FF5A36; padding: 40px 0;">서버 통신 중 오류가 발생했습니다.</div>`;
    }
}

// 도서 데이터를 카드 형태로 화면에 그려주는 함수
function renderBookList(books) {
    const container = document.getElementById('bookListContainer');
    if (!container) return;

    if (books.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #8C8276; padding: 50px 0;">검색 결과와 일치하는 도서가 없습니다.</div>`;
        return;
    }

    container.innerHTML = books.map(book => {
        // 대여 가능 상태에 따른 버튼 처리 (book.isAvailable 이 false 이거나 문자열 'false'일 때 대여중 처리)
        const isAvailable = (book.isAvailable === true || book.isAvailable === 'true');
        
        return `
            <div class="book-card" data-id="${book.id}">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <div class="book-author">${book.author} | ${book.publisher || '소소출판'}</div>
                </div>
                <div class="book-action">
                    <span class="book-status ${isAvailable ? 'status-available' : 'status-rented'}">
                        ${isAvailable ? '● 대여 가능' : '■ 대여 중'}
                    </span>
                    <button class="btn-rent" ${isAvailable ? '' : 'disabled'} onclick="rentBook('${book.id}', '${book.title.replace(/'/g, "\\'")}')">
                        ${isAvailable ? '대여하기' : '대여불가'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// 검색 처리 함수
function handleSearch() {
    const category = document.getElementById('searchCategory').value;
    const keyword = document.getElementById('searchKeyword').value.trim().toLowerCase();

    if (!window.allBooksData) return;

    // 카테고리별 필터링
    const filteredBooks = window.allBooksData.filter(book => {
        if (!keyword) return true; // 검색어가 없으면 전체 표시
        
        if (category === 'title') {
            return book.title.toLowerCase().includes(keyword);
        } else if (category === 'author') {
            return book.author.toLowerCase().includes(keyword);
        } else {
            // 전체 검색 (all)
            return book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword);
        }
    });

    renderBookList(filteredBooks);
}

// 대여하기 버튼 클릭 이벤트 함수
// dashboard-books.js
async function rentBook(bookId, bookTitle) {
    // 1. 선택한 도서 정보 찾기
    const book = window.allBooksData.find(b => b.id === bookId);
    
    if (!confirm(`[${bookTitle}] 도서를 대여하시겠습니까?`)) return;

    try {
        // 2. book 객체 전체를 전달
        const response = await API.rentBook(book); 
        // ... 이하 동일
    } catch (e) { /* ... */ }
}
