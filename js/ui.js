/**
 * ui.js
 * 화면에 로딩 표시 및 알림창(Toast)을 띄워주는 UI 공통 모듈입니다.
 */

const UI = {
    // 알림창(Toast) 띄우기 함수
    showToast(message, type = 'success') {
        let container = document.getElementById('toastContainer');
        
        // 만약 index.html에 toastContainer가 없다면 자동으로 화면에 생성
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            // 최소한의 기본 스타일을 코드로 부여합니다
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.left = '50%';
            container.style.transform = 'translateX(-50%)';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // 타입별 색상 지정 (스타일시트 미적용 대비 보완)
        let bgColor = '#333';
        if (type === 'error') bgColor = '#E74C3C';
        if (type === 'info') bgColor = '#3498DB';
        if (type === 'success') bgColor = '#2ECC71';
        
        toast.style.backgroundColor = bgColor;
        toast.style.color = '#fff';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.marginBottom = '10px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.fontSize = '14px';
        toast.style.transition = 'all 0.3s ease';
        toast.style.textAlign = 'center';
        toast.style.minWidth = '250px';

        toast.innerText = message;
        container.appendChild(toast);

        // 3초 뒤에 자동으로 사라지게 설정
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    },

    // 로딩바 보여주기
    showLoading() {
        let loader = document.getElementById('globalLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.style.position = 'fixed';
            loader.style.top = '0';
            loader.style.left = '0';
            loader.style.width = '100vw';
            loader.style.height = '100vh';
            loader.style.backgroundColor = 'rgba(255,255,255,0.7)';
            loader.style.display = 'flex';
            loader.style.justifyContent = 'center';
            loader.style.alignItems = 'center';
            loader.style.zIndex = '10000';
            loader.innerHTML = '<div style="font-size: 16px; color: #FF5A36; font-weight: bold;">잠시만 기다려주세요...</div>';
            document.body.appendChild(loader);
        } else {
            loader.style.display = 'flex';
        }
    },

    // 로딩바 숨기기
    hideLoading() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
};

// 다른 파일에서 UI.showToast로 접근할 수 있도록 전역 브라우저 창(window)에 명시적 등록
window.UI = UI;
