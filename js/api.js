// js/api.js
const API = {
    async post(action, payload = {}) {
        UI.showLoading();
        try {
            // GAS API 통신의 핵심: 
            // 1. method는 POST
            // 2. body는 문자열화된 JSON
            const response = await fetch(window.GAS_URL, {
                method: 'POST',
                body: JSON.stringify({ action, payload }) 
                // 헤더(Headers)를 명시적으로 넣지 않는 것이 GAS 통신 에러가 더 적습니다.
            });

            // GAS는 성공 시 200 혹은 리다이렉트 응답을 줍니다.
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            UI.hideLoading();
            return result;
        } catch (error) {
            UI.hideLoading();
            console.error('상세 에러 내용:', error);
            UI.showToast('통신 오류: ' + error.message, 'error');
            return { success: false, message: error.message };
        }
    }
};
