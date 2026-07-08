// app.js

// 로그인 상태 체크
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// 탭 전환 공통 로직
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target') || item.getAttribute('data-tab');
            if (!targetId) return;

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');

            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) pageTitle.innerText = item.innerText.trim();
        });
    });
}
