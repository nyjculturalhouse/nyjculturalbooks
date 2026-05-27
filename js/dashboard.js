let allBooks = [];

/** [초기화] 페이지 로드 시 실행 **/
document.addEventListener('DOMContentLoaded', () => {

    // 1. 사용자 인증 확인
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // 2. 상단 사용자 이름 표시
    const displayName =
        user.이름 ||
        user.name ||
        user.userId ||
        "사용자";

    if (document.getElementById('headerUserName')) {
        document.getElementById('headerUserName').innerText = displayName;
    }

    // 3. 내 정보 수정 초기값 세팅
    if (document.getElementById('infoUserId')) {
        document.getElementById('infoUserId').value =
            user.userId ||
            user.아이디 ||
            '';
    }

    if (document.getElementById('infoName')) {
        document.getElementById('infoName').value = displayName;
    }

    // 4. 초기 실행
    setupTabs();

    loadBooks();

    loadMyRentals();

    // 5. 로그아웃
    const btnLogout = document.getElementById('btnLogout');

    if (btnLogout) {

        btnLogout.addEventListener('click', () => {

            if (confirm('로그아웃 하시겠습니까?')) {

                localStorage.removeItem('currentUser');

                window.location.href = 'index.html';
            }
        });
    }

    // 6. 검색 및 필터 이벤트
    const searchInput =
        document.getElementById('searchBookInput');

    const catFilter =
        document.getElementById('filterCategory');

    const pubFilter =
        document.getElementById('filterPublisher');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    if (catFilter) {
        catFilter.addEventListener('change', applyFilters);
    }

    if (pubFilter) {
        pubFilter.addEventListener('change', applyFilters);
    }

    // 7. 정보 수정
    const updateForm =
        document.getElementById('updateInfoForm');

    if (updateForm) {
        updateForm.addEventListener(
            'submit',
            updateUserInfo
        );
    }

    // 8. 회원 탈퇴
    const btnWithdraw =
        document.getElementById('btnWithdraw');

    if (btnWithdraw) {
        btnWithdraw.addEventListener(
            'click',
            withdrawUser
        );
    }
});

/** [기능 1] 탭 전환 **/
function setupTabs() {

    const navItems =
        document.querySelectorAll('.nav-item');

    const sections =
        document.querySelectorAll('.view-section');

    const pageTitle =
        document.getElementById('pageTitle');

    navItems.forEach(item => {

        item.addEventListener('click', (e) => {

            e.preventDefault();

            const targetId =
                item.getAttribute('data-tab');

            if (!targetId) return;

            // active 초기화
            navItems.forEach(nav =>
                nav.classList.remove('active')
            );

            item.classList.add('active');

            // 섹션 전환
            sections.forEach(section => {

                section.style.display = 'none';

                section.classList.remove('active');

                if (section.id === targetId) {

                    section.style.display = 'block';

                    section.classList.add('active');
                }
            });

            // 제목 변경
            const titleMap = {
                'view-home': '홈',
                'view-rent-book': '도서 대여',
                'view-my-rentals': '대여 정보 조회/반납',
                'view-my-info': '내 정보'
            };

            if (pageTitle) {
                pageTitle.innerText =
                    titleMap[targetId] || '홈';
            }

            // 탭별 재로드
            if (targetId === 'view-my-rentals') {
                loadMyRentals();
            }

            if (targetId === 'view-rent-book') {
                loadBooks();
            }
        });
    });

    // 첫 탭 활성화
    const firstTab =
        document.querySelector(
            '.nav-item[data-tab="view-home"]'
        );

    if (firstTab) {
        firstTab.click();
    }
}

/** [기능 2] 정보 수정 **/
async function updateUserInfo(e) {

    e.preventDefault();

    const userId =
        document.getElementById('infoUserId').value;

    const newName =
        document.getElementById('infoName').value;

    const newPassword =
        document.getElementById('infoPassword').value;

    if (confirm("정보를 수정하시겠습니까?")) {

        UI.showToast('처리 중...', 'info');

        const res = await API.post(
            'updateUserInfo',
            {
                userId,
                name: newName,
                password: newPassword
            }
        );

        if (res.success) {

            UI.showToast('정보가 수정되었습니다.');

            const user =
                JSON.parse(
                    localStorage.getItem('currentUser')
                );

            user.이름 = newName;

            localStorage.setItem(
                'currentUser',
                JSON.stringify(user)
            );

            if (document.getElementById('headerUserName')) {

                document.getElementById(
                    'headerUserName'
                ).innerText = newName;
            }

        } else {

            UI.showToast(
                res.message || '수정 실패',
                'error'
            );
        }
    }
}

/** [기능 3] 회원 탈퇴 **/
async function withdrawUser() {

    if (
        confirm(
            "정말로 탈퇴하시겠습니까? 모든 대여 기록이 삭제됩니다."
        )
    ) {

        const user =
            JSON.parse(
                localStorage.getItem('currentUser')
            );

        const res = await API.post(
            'withdrawUser',
            {
                userId:
                    user.userId ||
                    user.아이디
            }
        );

        if (res.success) {

            alert("회원 탈퇴가 완료되었습니다.");

            localStorage.removeItem('currentUser');

            window.location.href = 'index.html';

        } else {

            UI.showToast(
                res.message || "탈퇴 처리 중 오류 발생",
                "error"
            );
        }
    }
}

/** [기능 4] 도서 렌더링 **/
function renderBooks(books) {

    const tbody =
        document.getElementById('booksTableBody');

    if (!tbody) return;

    tbody.innerHTML = books.map(b => {

        const isbn =
            b.ISBN ||
            b.isbn ||
            '';

        const statusText = String(
            b.상태 ||
            b.대여상태 ||
            '가능'
        );

        const isAvail =
            statusText.includes('가능') ||
            statusText.toUpperCase() === 'AVAILABLE';

        const dueDate =
            b.반납예정일 ||
            b.dueDate ||
            '';

        return `
            <tr>

                <td
                    class="title"
                    title="${b.도서명 || b.제목}"
                >
                    <strong>
                        ${b.도서명 || b.제목}
                    </strong>
                </td>

                <td>
                    ${b.카테고리 || b.분류 || '-'}
                </td>

                <td
                    title="${b.저자 || b.작가 || '-'}"
                >
                    ${b.저자 || b.작가 || '-'}
                </td>

                <td
                    title="${b.출판사 || b.publisher || '-'}"
                >
                    ${b.출판사 || b.publisher || '-'}
                </td>

                <td>

                    ${
                        !isAvail && dueDate
                        ? `
                            <div
                                style="
                                    font-size:12px;
                                    color:var(--danger);
                                    font-weight:700;
                                    margin-bottom:6px;
                                    white-space:nowrap;
                                "
                            >
                                반납일 ${dueDate}
                            </div>
                        `
                        : ''
                    }

                    <button
                        class="btn-rent ${!isAvail ? 'rented' : ''}"
                        ${!isAvail ? 'disabled' : ''}
                        onclick="rentBook('${isbn}')"
                    >
                        ${isAvail ? '대여' : '대여중'}
                    </button>

                </td>

            </tr>
        `;
    }).join('');
}

/** [기능 5] 내 대여 현황 **/
async function loadMyRentals(type = 'current') {

    const user =
        JSON.parse(
            localStorage.getItem('currentUser')
        );

    const res = await API.post(
        'getMyRentals',
        {
            userId:
                user.userId ||
                user.아이디
        }
    );

    const tbody =
        document.getElementById(
            'myRentalsTableBody'
        );

    if (!tbody) return;

    const btnCurrent =
        document.getElementById(
            'btnCurrentRentals'
        );

    const btnHistory =
        document.getElementById(
            'btnRentalHistory'
        );

    if (btnCurrent && btnHistory) {

        btnCurrent.classList.remove('active');

        btnHistory.classList.remove('active');

        if (type === 'current') {

            btnCurrent.classList.add('active');

        } else {

            btnHistory.classList.add('active');
        }

        btnCurrent.onclick =
            () => loadMyRentals('current');

        btnHistory.onclick =
            () => loadMyRentals('history');
    }

    if (res.success && res.data.length > 0) {

        const currentRentals =
            res.data.filter(r => {

                return String(
                    r.반납여부 || ""
                )
                .trim()
                .toUpperCase() !== 'Y';
            });

        const historyRentals =
            res.data.filter(r => {

                return String(
                    r.반납여부 || ""
                )
                .trim()
                .toUpperCase() === 'Y';
            });

        const targetData =
            type === 'current'
                ? currentRentals
                : historyRentals;

        if (targetData.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-message">
                        ${
                            type === 'current'
                            ? '대여 중인 도서가 없습니다.'
                            : '대출 이력이 없습니다.'
                        }
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML =
            targetData
                .reverse()
                .map(r => {

                    const rId =
                        r.대여ID ||
                        r.rentalId ||
                        r[0];

                    return `
                        <tr>

                            <td
                                class="title"
                                title="${r.도서명 || r.제목}"
                            >
                                ${r.도서명 || r.제목}
                            </td>

                            <td>
                                ${r.대여일 || '-'}
                            </td>

                            <td>
                                ${
                                    type === 'current'
                                    ? (
                                        r.반납예정일 || '-'
                                    )
                                    : (
                                        r.반납일 || '반납완료'
                                    )
                                }
                            </td>

                            <td>

                                ${
                                    type === 'current'
                                    ? `
                                        <div
                                            style="
                                                display:flex;
                                                gap:6px;
                                                justify-content:center;
                                            "
                                        >

                                            <button
                                                class="btn-rent"
                                                style="background-color:var(--primary);"
                                                onclick="returnBook('${rId}', '${r.ISBN || r.isbn}')"
                                            >
                                                반납
                                            </button>

                                            <button
                                                class="btn-rent"
                                                style="background-color:var(--danger);"
                                                onclick="deleteRental('${rId}', '${r.ISBN || r.isbn}')"
                                            >
                                                삭제
                                            </button>

                                        </div>
                                    `
                                    : `
                                        <span
                                            style="
                                                color:var(--text-light);
                                                font-size:13px;
                                                font-weight:600;
                                            "
                                        >
                                            반납완료
                                        </span>
                                    `
                                }

                            </td>

                        </tr>
                    `;
                })
                .join('');

    } else {

        tbody.innerHTML =
            `
                <tr>
                    <td colspan="4" class="empty-message">
                        대여 정보가 없습니다.
                    </td>
                </tr>
            `;
    }
}

/** [기능 6] 도서 데이터 로드 **/
async function loadBooks() {

    try {

        const res =
            await API.post('getBooks');

        const rentalRes =
            await API.post('getRentalHistory');

        if (res.success) {

            let rentalMap = {};

            if (
                rentalRes.success &&
                rentalRes.data
            ) {

                rentalRes.data.forEach(r => {

                    const isReturned =
                        String(
                            r.반납여부 || ''
                        )
                        .trim()
                        .toUpperCase() === 'Y';

                    if (!isReturned) {

                        const isbn =
                            String(
                                r.ISBN ||
                                r.isbn ||
                                r[2] ||
                                ''
                            ).trim();

                        rentalMap[isbn] = {

                            dueDate:
                                r.반납예정일 ||
                                r.dueDate ||
                                r[5] ||
                                ''
                        };
                    }
                });
            }

            allBooks =
                res.data
                    .map(book => {

                        const isbn =
                            String(
                                book.ISBN ||
                                book.isbn ||
                                ''
                            ).trim();

                        return {

                            ...book,

                            반납예정일:
                                rentalMap[isbn]
                                    ? rentalMap[isbn].dueDate
                                    : ''
                        };
                    })
                    .sort((a, b) => {

                        return String(
                            a.도서명 ||
                            a.제목 ||
                            ''
                        ).localeCompare(
                            String(
                                b.도서명 ||
                                b.제목 ||
                                ''
                            ),
                            'ko'
                        );
                    });

            updateFilterOptions(allBooks);

            renderBooks(allBooks);

            renderNewBooks(res.data);

            if (
                rentalRes.success &&
                rentalRes.data
            ) {

                renderPopularBooks(
                    allBooks,
                    rentalRes.data
                );
            }
        }

    } catch (error) {

        console.error(
            "데이터 로드 오류:",
            error
        );
    }
}

/** [기능 7] 신간 도서 **/
function renderNewBooks(books) {

    const list =
        document.getElementById('newBooksList');

    if (!list) return;

    const newBooks =
        [...books]
            .slice(-3)
            .reverse();

    list.innerHTML =
        newBooks.map(b => `
            <div class="ranking-item">

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                    "
                >

                    <span class="new-badge">
                        NEW
                    </span>

                    <span
                        class="new-book-title"
                        style="font-weight:600;"
                    >
                        ${b.도서명 || b.제목}
                    </span>

                </div>

                <div
                    style="
                        color:var(--text-light);
                        font-size:13px;
                        margin-top:4px;
                        padding-left:50px;
                    "
                >
                    ${b.저자 || '-'}
                </div>

            </div>
        `).join('');
}

/** [기능 8] 인기 도서 **/
function renderPopularBooks(books, history) {

    const list =
        document.getElementById(
            'popularBooksList'
        );

    if (!list) return;

    const counts = {};

    history.forEach(record => {

        const title =
            record.도서명 ||
            record.제목 ||
            record[1];

        if (title) {

            counts[title] =
                (counts[title] || 0) + 1;
        }
    });

    const sorted =
        Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

    list.innerHTML =
        sorted.map((item, i) => `
            <div
                class="ranking-item"
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                    "
                >

                    <span
                        class="rank-badge"
                        style="
                            background:var(--bg-color);
                            padding:2px 8px;
                            border-radius:6px;
                            font-size:12px;
                            font-weight:700;
                        "
                    >
                        ${i + 1}
                    </span>

                    <span
                        style="
                            font-weight:600;
                            max-width:180px;
                            overflow:hidden;
                            text-overflow:ellipsis;
                            white-space:nowrap;
                        "
                    >
                        ${item[0]}
                    </span>

                </div>

                <span class="rent-count-badge">
                    ${item[1]}회 대여
                </span>

            </div>
        `).join('');
}

/** [기능 9] 대여 **/
async function rentBook(isbn) {

    const user =
        JSON.parse(
            localStorage.getItem('currentUser')
        );

    const book =
        allBooks.find(b => {

            return String(
                b.ISBN || b.isbn
            ) === String(isbn);
        });

    if (!book) return;

    const res =
        await API.post(
            'rentBook',
            {
                userId:
                    user.userId ||
                    user.아이디,

                isbn,

                title:
                    book.도서명 ||
                    book.제목
            }
        );

    if (res.success) {

        UI.showToast('대여 완료!');

        loadBooks();

        loadMyRentals();
    }
}

/** [기능 10] 반납 **/
async function returnBook(rentalId, isbn) {

    const res =
        await API.post(
            'returnBook',
            {
                rentalId,
                isbn
            }
        );

    if (res.success) {

        UI.showToast('반납 완료!');

        loadBooks();

        loadMyRentals();
    }
}

/** [기능 11] 대여 기록 삭제 **/
async function deleteRental(rentalId, isbn) {

    if (
        !confirm(
            '대여 기록을 삭제하시겠습니까?'
        )
    ) return;

    const res =
        await API.post(
            'deleteRental',
            {
                rentalId,
                isbn
            }
        );

    if (res.success) {

        UI.showToast('삭제 완료!');

        loadBooks();

        loadMyRentals();
    }
}

/** [기능 12] 필터 옵션 **/
function updateFilterOptions(books) {

    const categorySelect =
        document.getElementById(
            'filterCategory'
        );

    const publisherSelect =
        document.getElementById(
            'filterPublisher'
        );

    if (
        !categorySelect ||
        !publisherSelect
    ) return;

    categorySelect.innerHTML =
        '<option value="">전체 카테고리</option>';

    publisherSelect.innerHTML =
        '<option value="">전체 출판사</option>';

    [
        ...new Set(
            books
                .map(
                    b => b.카테고리 || b.분류
                )
                .filter(Boolean)
        )
    ]
    .sort()
    .forEach(cat => {

        const opt =
            document.createElement('option');

        opt.value = cat;

        opt.innerText = cat;

        categorySelect.appendChild(opt);
    });

    [
        ...new Set(
            books
                .map(
                    b => b.출판사 || b.publisher
                )
                .filter(Boolean)
        )
    ]
    .sort()
    .forEach(pub => {

        const opt =
            document.createElement('option');

        opt.value = pub;

        opt.innerText = pub;

        publisherSelect.appendChild(opt);
    });
}

/** [기능 13] 필터 적용 **/
function applyFilters() {

    const keyword =
        document.getElementById(
            'searchBookInput'
        )
        .value
        .toLowerCase();

    const selectedCategory =
        document.getElementById(
            'filterCategory'
        ).value;

    const selectedPublisher =
        document.getElementById(
            'filterPublisher'
        ).value;

    const filtered =
        allBooks.filter(book => {

            const title =
                (
                    book.도서명 ||
                    book.제목 ||
                    ''
                )
                .toLowerCase();

            const author =
                (
                    book.저자 ||
                    book.작가 ||
                    ''
                )
                .toLowerCase();

            const category =
                book.카테고리 ||
                book.분류 ||
                '';

            const publisher =
                book.출판사 ||
                book.publisher ||
                '';

            const matchKeyword =
                title.includes(keyword) ||
                author.includes(keyword);

            const matchCategory =
                selectedCategory === "" ||
                category === selectedCategory;

            const matchPublisher =
                selectedPublisher === "" ||
                publisher === selectedPublisher;

            return (
                matchKeyword &&
                matchCategory &&
                matchPublisher
            );
        });

    renderBooks(filtered);
}
