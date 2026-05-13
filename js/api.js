// js/api.js (교체용)
const API = {
    async post(action, payload = {}) {
        UI.showLoading();
        try {
            // 주소 뒤에 파라미터를 붙이지 않고 body에 담아 보냅니다.
            const response = await fetch(window.GAS_URL, {
                method: 'POST',
                mode: 'cors', // CORS 허용
                body: JSON.stringify({ action, payload })
            });

            // 응답이 정상인지 확인
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            UI.hideLoading();
            return result;
        } catch (error) {
            UI.hideLoading();
            console.error('상세 에러 내용:', error);
            // 만약 여기서 또 '<' 에러가 난다면, 서버가 JSON이 아닌 HTML을 보낸 것입니다.
            UI.showToast('서버 응답 형식 오류가 발생했습니다.', 'error');
            return { success: false, message: error.message };
        }
    }
};
