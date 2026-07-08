/** [도서 관련 기능 - 고도화 버전] **/

let allBooks = [];

function renderBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;

    // 대여 가능 필터 상태 확인
    const filterAvailableOnly = document.getElementById('filterAvailableOnly')?.checked;
    let displayBooks = books;
    if (filterAvailableOnly) {
        displayBooks = books.filter(b => {
            const statusText = String(b.상태 || b.대여상태 || '가능');
            return statusText.includes('가능') || statusText.toUpperCase() === 'AVAILABLE';
        });
    }

    tbody.innerHTML = displayBooks.map(b => {
        const isbn = b.ISBN || b.isbn || '';
        const statusText = String(b.상태 || b.대여상태 || '가능');
        const isAvail = statusText.includes('가능') || statusText.toUpperCase() === 'AVAILABLE';
        const dueDate = b.반납예정일 || b.dueDate || '';
        
        return `<tr class="border-b">
            <td class="p-4 font-semibold">${b.도서명 || b.제목}</td>
            <td class="p-4 text-sm text-gray-600">${b.카테고리 || b.분류 || '-'}</td>
            <td class="p-4 text-sm">${b.저자 || b.작가 || '-'}</td>
            <td class="p-4 text-sm">${b.출판사 || b.publisher || '-'}</td>
            <td class="p-4 text-center">
                ${!isAvail ? `<span class="text-xs font-bold text-red-500 block mb-1">대여중</span>` : ''}
                <button class="px-4 py-1.5 rounded-lg text-sm font-bold transition ${isAvail ? 'bg-[#FF5A36] text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}" 
                        ${!isAvail ? 'disabled' : ''} onclick="rentBook('${isbn}')">${isAvail ? '대여' : '불가'}</button>
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
            let hasOverdue = false; // 연체 확인 플래그
            const today = new Date().toISOString().split('T')[0];

            if (rentalRes.success && rentalRes.data) {
                rentalRes.data.forEach(r => {
                    const isReturned = String(r.반납여부 || '').trim().toUpperCase() === 'Y';
                    const dueDate = r.반납예정일 || r.dueDate || r[5] || '';
                    
                    if (!isReturned) {
                        const isbn = String(r.ISBN || r.isbn || r[2] || '').trim();
                        rentalMap[isbn] = { dueDate: dueDate };
                        
                        // 연체 여부 체크
                        if (dueDate && dueDate < today) hasOverdue = true;
                    }
                });
            }

            // 연체 도서가 있다면 모달 표시
            if (hasOverdue) {
                document.getElementById('overdueModal')?.classList.remove('hidden');
            }

            allBooks = res.data.map(book => {
                const isbn = String(book.ISBN || book.isbn || '').trim();
                return { ...book, 반납예정일: rentalMap[isbn] ? rentalMap[isbn].dueDate : '' };
            }).sort((a, b) => String(a.도서명 || a.제목 || '').localeCompare(String(b.도서명 || b.제목 || ''), 'ko'));
            
            updateFilterOptions(allBooks);
            renderBooks(allBooks);
            // ... (기타 렌더링 함수 유지)
        }
    } catch (error) { console.error("데이터 로드 오류:", error); }
}

// 필터링 이벤트 연결
document.getElementById('filterAvailableOnly')?.addEventListener('change', () => renderBooks(allBooks));
document.getElementById('searchBookInput')?.addEventListener('input', applyFilters);

function applyFilters() {
    const keyword = document.getElementById('searchBookInput').value.toLowerCase();
    const selectedCategory = document.getElementById('filterCategory').value;
    
    const filtered = allBooks.filter(book => {
        const title = (book.도서명 || book.제목 || '').toLowerCase();
        const category = book.카테고리 || book.분류 || '';
        return title.includes(keyword) && (selectedCategory === "" || category === selectedCategory);
    });
    renderBooks(filtered);
}

// [나머지 rentBook, returnBook, updateFilterOptions 함수는 기존과 동일하게 유지하시면 됩니다.]
