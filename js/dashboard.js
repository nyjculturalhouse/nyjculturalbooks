// dashboard.js - 프로젝트의 전체 로드맵
document.addEventListener('DOMContentLoaded', () => {
    console.log("대시보드 초기화 시작...");

    // 1. UI 탭 기능 초기화 (ui.js에 있는 함수)
    if (typeof UI !== 'undefined') {
        UI.initTabs();
    }

    // 2. 각 기능 파일들의 함수들 호출
    // 각각의 파일(dashboard-books.js, dashboard-user.js 등)에 있는 함수를 여기서 실행합니다.
    if (typeof loadBooks === 'function') {
        loadBooks(); // 도서 목록 로드 (dashboard-books.js)
    }
    
    if (typeof loadMyRentals === 'function') {
        loadMyRentals(); // 내 대여 현황 로드 (dashboard-books.js 또는 user.js)
    }

    // 3. 로그아웃 버튼 이벤트 리스너 추가
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    
    console.log("대시보드 초기화 완료!");
});
