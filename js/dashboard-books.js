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
        const response = await API.getBooks();
        
        if (response && response.success && Array.isArray(response.data)) {
            window.allBooksData = response.data; 
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
        // 시트 헤더 '상태' 값 기준 ('대여가능' 문자열 확인)
        const isAvailable = (book.상태 === '대여가능');
        
        return `
            <div class="book-card" data-id="${book.ISBN}">
                <div class="book-info">
                    <h3>${book.도서명}</h3>
                    <div class="book-author">${book.저자} | ${book.출판사 || '소소출판'}</div>
                </div>
                <div class="book-action">
                    <span class="book-status ${isAvailable ? 'status-available' : 'status-rented'}">
                        ${isAvailable ? '● 대여 가능' : '■ 대여 중'}
                    </span>
                    <button class="btn-rent" ${isAvailable ? '' : 'disabled'} onclick="rentBook('${book.ISBN}', '${book.도서명.replace(/'/g, "\\'")}')">
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

    const filteredBooks = window.allBooksData.filter(book => {
        if (!keyword) return true;
        
        // 시트 헤더 명칭(도서명, 저자)에 맞춰 필터링
        if (category === 'title') {
            return book.도서명.toLowerCase().includes(keyword);
        } else if (category === 'author') {
            return book.저자.toLowerCase().includes(keyword);
        } else {
            return book.도서명.toLowerCase().includes(keyword) || book.저자.toLowerCase().includes(keyword);
        }
    });

    renderBookList(filteredBooks);
}

// 대여하기 버튼 클릭 이벤트 함수
async function rentBook(isbn, bookTitle) {
    // 1. 선택한 도서 정보 찾기
    const book = window.allBooksData.find(b => b.ISBN === isbn);
    
    if (!confirm(`[${bookTitle}] 도서를 대여하시겠습니까?`)) return;

    try {
        // 2. book 객체 전체를 전달 (API.rentBook에서 내부적으로 처리)
        const response = await API.rentBook(book);
        
        if (response && response.success) {
            if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
                UI.showToast('도서 대여가 성공적으로 완료되었습니다!', 'success');
            } else {
                alert('도서 대여가 성공적으로 완료되었습니다!');
            }
            await loadBooks(); // 리스트 새로고침
        } else {
            alert(response.message || '대여에 실패했습니다.');
        }
    } catch (error) {
        console.error("대여 요청 중 오류:", error);
        alert('서버와 통신 중 오류가 발생했습니다.');
    }
}
