const UI = {
    // 1. 섹션 전환 기능 (data-tab 속성 우선 지원)
    initTabs() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.view-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // data-tab 속성 가져오기
                const targetId = item.getAttribute('data-tab');
                
                if (targetId) {
                    // 모든 섹션 숨김 및 메뉴 비활성화
                    sections.forEach(s => s.classList.remove('active'));
                    navItems.forEach(n => n.classList.remove('active-nav'));

                    // 선택한 섹션 표시 및 메뉴 활성화
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        targetSection.classList.add('active');
                        item.classList.add('active-nav');
                        
                        // 헤더 타이틀 동기화 (옵션)
                        const pageTitle = document.getElementById('pageTitle');
                        if (pageTitle) pageTitle.innerText = item.innerText.trim();
                    }
                }
            });
        });
    },

    // ... 나머지 showLoading, hideLoading, showToast는 그대로 유지
};

document.addEventListener('DOMContentLoaded', () => {
    UI.initTabs();
});
