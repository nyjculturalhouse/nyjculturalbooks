// 본인의 GAS 웹앱 URL로 반드시 변경하세요.
window.GAS_URL = 'https://script.google.com/macros/s/AKfycbyHmROHxGfgjPXqWz5n8WAFqzPcxESJnYzd-YLXa-bTpZm5boVMerAvDnQ89Fqj-jHu/exec';

// 로그인 상태 체크
function checkAuth(requireAdmin = false) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    if (requireAdmin && user.role !== 'ADMIN') {
        alert('관리자 권한이 필요합니다.');
        window.location.href = 'dashboard.html';
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
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            
            document.getElementById('pageTitle').innerText = item.innerText;
        });
    });
}
