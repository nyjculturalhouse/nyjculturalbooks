// dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    // 1. 사용자 정보 표시
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('userName').innerText = user.이름 || '회원';
    }

    // 2. 데이터 로드
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        const response = await API.getBooks();
        if (!response || !response.success) return;

        const books = response.data;
        renderNewBooks(books);
        renderPopularBooks(books);
        updateStatistics(books);
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
}

// 신간 도서 렌더링 (최신 8권)
function renderNewBooks(books) {
    const container = document.getElementById('newBooksContainer');
    if (!container) return;

    const newBooks = books.slice(-8).reverse();
    container.innerHTML = newBooks.map(book => `
        <div class="bg-[#FAF9F6] p-4 rounded-lg border border-outline-variant/50">
            <div class="text-sm text-primary font-medium truncate">${book.도서명}</div>
            <div class="text-[11px] text-on-surface-variant mt-1">${book.저자}</div>
        </div>
    `).join('');
}

// 인기 도서 렌더링
function renderPopularBooks(books) {
    const container = document.getElementById('popularBooksContainer');
    if (!container) return;

    const popular = books.slice(0, 5);
    container.innerHTML = popular.map((book, index) => `
        <li class="flex items-center gap-4 py-2">
            <span class="text-secondary font-medium w-4">${index + 1}</span>
            <span class="text-sm text-primary truncate flex-1">${book.도서명}</span>
        </li>
    `).join('');
}

// 통계 업데이트
function updateStatistics(books) {
    const renting = books.filter(b => b.상태 === '대여중').length;
    document.getElementById('rentingCount').innerText = renting + '권';
}
