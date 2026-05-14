const UI = {
    // 1. 섹션 전환 기능 (2번 요청: 버튼을 눌러야 해당 섹션만 표시)
    // HTML의 메뉴 버튼에 data-target="카드ID" 속성을 추가해야 합니다.
    initTabs() {
        const navItems = document.querySelectorAll('.nav-item, .nav-link, #sidebar a');
        const cards = document.querySelectorAll('.card');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // 특정 ID를 가진 섹션을 찾는 로직
                const href = item.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetCard = document.getElementById(targetId);

                    if (targetCard) {
                        // 모든 카드 숨김 및 메뉴 비활성화
                        cards.forEach(card => card.classList.remove('active'));
                        navItems.forEach(nav => nav.classList.remove('active'));

                        // 선택한 카드 표시 및 메뉴 활성화
                        targetCard.classList.add('active');
                        item.classList.add('active');
                    }
                }
            });
        });
    },

    // 로딩 스피너 표시
    showLoading() {
        if (document.getElementById('loading-spinner')) return;
        const spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinner);
    },

    // 로딩 스피너 숨김
    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) spinner.remove();
    },

    // 팝콘처럼 톡 튀어나오는 토스트 알림 (화면 중앙 + 배경 어둡게 수정)
    showToast(message, type = 'success') {

        // 기존 토스트 제거
        const oldOverlay = document.getElementById('toast-overlay');
        if (oldOverlay) oldOverlay.remove();

        // 오버레이 생성
        const overlay = document.createElement('div');
        overlay.id = 'toast-overlay';

        // 토스트 생성
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;

        overlay.appendChild(toast);
        document.body.appendChild(overlay);

        // 10ms 뒤에 'show' 클래스를 추가하여 팝콘 애니메이션 발동
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3초 후 다시 작아지며 사라지고 요소 삭제
        setTimeout(() => {
            toast.classList.remove('show');

            setTimeout(() => {
                overlay.remove();
            }, 400);

        }, 3000);
    }
};

// 페이지 로드 시 탭 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
    UI.initTabs();
});
