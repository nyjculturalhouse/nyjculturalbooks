// js/api.js 수정
async post(action, payload = {}) {
    UI.showLoading();
    
    // 안전장치: URL이 없으면 실행 중단
    if (!window.GAS_URL) {
        UI.hideLoading();
        console.error("에러: GAS_URL이 설정되지 않았습니다.");
        alert("시스템 설정 오류: 관리자에게 문의하세요.");
        return { success: false };
    }

    try {
        const response = await fetch(window.GAS_URL, {
            method: 'POST',
            body: JSON.stringify({ action, payload })
        });
        // ... 이하 동일
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
