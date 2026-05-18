// 본인의 GAS 웹앱 URL로 반드시 변경하세요.
window.GAS_URL = 'https://script.google.com/macros/s/AKfycby8hvXjgaLn8SqlKtM2-PrROvd3q2D5rKqYfPVZTngCfIV2Ep6hGsVidyw6MReGMU_b/exec';

// 로그인 상태 체크
function checkAuth(requireAdmin = false) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    
    // 한글 헤더 '권한'과 영어 'role' 모두 대응하도록 수정
    const userRole = user.권한 || user.role || '';
    
    if (requireAdmin && userRole !== 'ADMIN') {
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
