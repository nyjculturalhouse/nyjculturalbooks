/**
 * ui.js
 * 정말 큰 틀의 규격만 정의해두고, 구체적인 화면 처리는 
 * 각 HTML 페이지의 스크립트(window.showIndexModal 등)에 위임합니다.
 */

const UI = {
    // 알림 요청이 들어왔을 때 실행되는 큰 틀의 함수
    showToast(message, type = 'success') {
        // "확인 중...", "처리 중..." 같은 중간 과정 안내 멘트는 무시합니다.
        if (message.includes('확인 중') || message.includes('처리 중')) {
            return; 
        }

        // 현재 페이지(index.html 등)에 등록된 모달 함수가 있다면 실행합니다.
        if (typeof window.showIndexModal === 'function') {
            window.showIndexModal(message);
        } else {
            // 혹시 다른 페이지에서 이 함수가 없을 때를 대비한 기본 경고창(fallback)
            if (type === 'error' || message.includes('실패')) {
                alert(message);
            }
        }
    },

    // 로딩바는 요청대로 작동하지 않도록 완전히 비워둡니다.
    showLoading() {},
    hideLoading() {}
};

// 전역 등록
window.UI = UI;
