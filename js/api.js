const API = {
    async post(action, payload = {}) {
        UI.showLoading();
        try {
            // mode: 'no-cors'를 쓰면 응답을 읽을 수 없음. text/plain으로 전송하여 프리플라이트 회피.
// js/api.js 수정 (6번째 줄 근처)
const response = await fetch(window.GAS_URL, {  // GAS_URL -> window.GAS_URL
    method: 'POST',
    // ... 나머지 코드 동일
                body: JSON.stringify({ action, payload })
            });
            const result = await response.json();
            UI.hideLoading();
            return result;
        } catch (error) {
            UI.hideLoading();
            console.error('API Error:', error);
            UI.showToast('서버 통신 중 오류가 발생했습니다.', 'error');
            return { success: false, message: 'Network error' };
        }
    }
};
