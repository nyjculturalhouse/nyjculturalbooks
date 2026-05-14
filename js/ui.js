const UI = {
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

    // 팝콘처럼 톡 튀어나오는 토스트 알림
    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        // CSS에서 설정한 .toast.success 또는 .toast.error 클래스 적용
        toast.className = `toast ${type}`;
        toast.innerText = message;
        
        container.appendChild(toast);

        // 10ms 뒤에 'show' 클래스를 추가하여 팝콘 애니메이션(scale) 발동
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3초 후 다시 작아지며 사라지고 요소 삭제
        setTimeout(() => {
            toast.classList.remove('show');
            // 애니메이션이 끝나는 시간(400ms) 뒤에 DOM에서 완전히 제거
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }
};
