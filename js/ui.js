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

    // 팝콘처럼 톡 튀어나오는 토스트 알림 (4번 요청: 로그인 창 위에 뜨도록 수정)
    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            
            // 로그인 화면(auth-card)이 있으면 그 바로 위에 삽입, 없으면 body에 삽입
            const authCard = document.querySelector('.auth-card');
            if (authCard) {
                authCard.parentNode.insertBefore(container, authCard);
            } else {
                document.body.appendChild(container);
            }
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        
        container.appendChild(toast);

        // 10ms 뒤에 'show' 클래스를 추가하여 팝콘 애니메이션 발동
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3초 후 다시 작아지며 사라지고 요소 삭제
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }
};

// 페이지 로드 시 탭 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
    UI.initTabs();
});
