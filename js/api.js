// js/api.js
const API = {
    async post(action, payload = {}) {
        UI.showLoading();
        try {
            // window.GAS_URL을 사용해야 합니다.
            const response = await fetch(window.GAS_URL, {
                method: 'POST',
                // 헤더를 생략하거나 간단하게 두는 것이 GAS 리다이렉션 처리에 유리합니다.
                body: JSON.stringify({ action, payload })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            UI.hideLoading();
            return result;
        } catch (error) {
            UI.hideLoading();
            console.error('API 통신 에러:', error);
            // 여기서 SyntaxError가 난다면 서버(GAS)가 JSON이 아닌 에러 HTML을 보낸 것입니다.
            return { success: false, message: error.message };
        }
    }
};
