document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) { window.location.href = 'index.html'; return; }

    const displayName = user.이름 || user.name || user.userId || "사용자";
    if (document.getElementById('headerUserName')) document.getElementById('headerUserName').innerText = displayName;
    if (document.getElementById('infoUserId')) document.getElementById('infoUserId').value = user.userId || user.아이디 || '';
    if (document.getElementById('infoName')) document.getElementById('infoName').value = displayName;

    setupTabs();
    loadBooks();
    loadMyRentals();

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('로그아웃 하시겠습니까?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }

    const searchInput = document.getElementById('searchBookInput');
    const catFilter = document.getElementById('filterCategory');
    const pubFilter = document.getElementById('filterPublisher');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (catFilter) catFilter.addEventListener('change', applyFilters);
    if (pubFilter) pubFilter.addEventListener('change', applyFilters);
    if (document.getElementById('updateInfoForm')) document.getElementById('updateInfoForm').addEventListener('submit', updateUserInfo);
    if (document.getElementById('btnWithdraw')) document.getElementById('btnWithdraw').addEventListener('click', withdrawUser);
});

function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('pageTitle');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-tab');
            if (!targetId) return;
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
                if (section.id === targetId) { section.style.display = 'block'; section.classList.add('active'); }
            });
            const titleMap = { 'view-home': '홈', 'view-rent-book': '도서 대여', 'view-my-rentals': '대여 정보 조회/반납', 'view-my-info': '내 정보' };
            if (pageTitle) pageTitle.innerText = titleMap[targetId] || '홈';
            if (targetId === 'view-my-rentals') loadMyRentals();
            if (targetId === 'view-rent-book') loadBooks();
        });
    });
    const firstTab = document.querySelector('.nav-item[data-tab="view-home"]');
    if (firstTab) firstTab.click();
}
